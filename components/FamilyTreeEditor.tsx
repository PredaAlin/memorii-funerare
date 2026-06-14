'use client'

import React, { useEffect, useState } from 'react'
import type { FamilyMember, FamilyPartner } from '@/types'
import { getTheme } from '@/lib/themes'
import { FamilyTree } from '@/components/FamilyTree'

interface FamilyTreeEditorProps {
  value: FamilyMember | null
  onChange: (next: FamilyMember | null) => void
  deceasedName?: string
  currentMemorialId?: string
}

interface MyMemorial { id: string; deceasedName: string }

const genId = () => Math.random().toString(36).slice(2, 11)
const newMember = (): FamilyMember => ({ id: genId(), name: '', children: [] })
const newPartner = (): FamilyPartner => ({ id: genId(), name: '' })

// ---- immutable tree helpers (operate on the bloodline root) ----
function mapTree(node: FamilyMember, fn: (n: FamilyMember) => FamilyMember): FamilyMember {
  const m = fn(node)
  return { ...m, children: m.children.map(c => mapTree(c, fn)) }
}
function findNode(node: FamilyMember, id: string): FamilyMember | null {
  if (node.id === id) return node
  for (const c of node.children) { const f = findNode(c, id); if (f) return f }
  return null
}
function findParent(root: FamilyMember, id: string): FamilyMember | null {
  for (const c of root.children) {
    if (c.id === id) return root
    const f = findParent(c, id); if (f) return f
  }
  return null
}
function findPartnerOwner(root: FamilyMember, partnerId: string): FamilyMember | null {
  if (root.spouse?.id === partnerId) return root
  for (const c of root.children) { const f = findPartnerOwner(c, partnerId); if (f) return f }
  return null
}
function updateNode(root: FamilyMember, id: string, patch: Partial<FamilyMember>): FamilyMember {
  return mapTree(root, n => (n.id === id ? { ...n, ...patch } : n))
}
function updatePartner(root: FamilyMember, partnerId: string, patch: Partial<FamilyPartner>): FamilyMember {
  return mapTree(root, n => (n.spouse?.id === partnerId ? { ...n, spouse: { ...n.spouse, ...patch } } : n))
}
function removeFromChildren(node: FamilyMember, id: string): FamilyMember {
  return { ...node, children: node.children.filter(c => c.id !== id).map(c => removeFromChildren(c, id)) }
}
function markSelf(root: FamilyMember, targetId: string | null): FamilyMember {
  return mapTree(root, n => ({
    ...n,
    isSelf: n.id === targetId,
    spouse: n.spouse ? { ...n.spouse, isSelf: n.spouse.id === targetId } : n.spouse,
  }))
}
function needsNormalize(node: FamilyMember): boolean {
  if (!node.id) return true
  if (node.spouse && !node.spouse.id) return true
  return (node.children ?? []).some(needsNormalize)
}
function normalizeIds(node: FamilyMember): FamilyMember {
  return {
    ...node,
    id: node.id || genId(),
    spouse: node.spouse ? { ...node.spouse, id: node.spouse.id || genId() } : node.spouse,
    children: (node.children ?? []).map(normalizeIds),
  }
}

const btn = 'px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors'
const inputCls = 'w-full px-3 py-2 rounded-lg border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-amber-500 transition-all'

export const FamilyTreeEditor: React.FC<FamilyTreeEditorProps> = ({ value, onChange, deceasedName, currentMemorialId }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  // Link-picker state (one person selected at a time, so component-level is fine)
  const [linkOpen, setLinkOpen] = useState(false)
  const [pasteValue, setPasteValue] = useState('')
  const [pasteError, setPasteError] = useState<string | null>(null)
  const [myMemorials, setMyMemorials] = useState<MyMemorial[] | null>(null)

  // Reset the link picker whenever the selection changes.
  const select = (id: string | null) => {
    setSelectedId(id)
    setLinkOpen(false)
    setPasteValue('')
    setPasteError(null)
  }

  // Backfill ids on older local drafts.
  useEffect(() => {
    if (value && needsNormalize(value)) onChange(normalizeIds(value))
  }, [value, onChange])

  const loadMyMemorials = async () => {
    if (myMemorials !== null) return
    try {
      const res = await fetch('/api/memorials')
      if (!res.ok) { setMyMemorials([]); return }
      const list: Array<MyMemorial & { isPublished: boolean }> = await res.json()
      setMyMemorials(
        list.filter(m => m.isPublished && m.id !== currentMemorialId).map(m => ({ id: m.id, deceasedName: m.deceasedName })),
      )
    } catch { setMyMemorials([]) }
  }

  if (!value) {
    return (
      <button
        type="button"
        onClick={() => {
          const root: FamilyMember = { id: genId(), name: deceasedName ?? '', isSelf: true, children: [] }
          onChange(root)
          select(root.id)
        }}
        className="w-full rounded-2xl border-2 border-dashed border-stone-200 py-8 text-sm font-bold text-stone-500 hover:bg-stone-50 hover:text-amber-600 transition-all"
      >
        + Adaugă prima persoană
      </button>
    )
  }

  const root = value
  const toggleSelect = (id: string) => select(selectedId === id ? null : id)

  const renderMenu = (id: string): React.ReactNode => {
    const node = findNode(root, id)
    const isPartner = !node
    const ownerNode = isPartner ? findPartnerOwner(root, id) : null
    const person: FamilyMember | FamilyPartner | null | undefined = node ?? ownerNode?.spouse
    if (!person) return null

    // Action availability
    const parent = node ? findParent(root, node.id) : null
    const canAddChild = true
    const canAddPartner = !!node && !node.spouse
    const canAddSibling = !!node && !!parent
    const canAddParent = !!node && (node.id === root.id || (!!parent && !parent.spouse))

    const patchName = (name: string) =>
      onChange(isPartner ? updatePartner(root, id, { name }) : updateNode(root, id, { name }))
    const patchRelation = (relation: string) =>
      onChange(isPartner ? updatePartner(root, id, { relation }) : updateNode(root, id, { relation }))

    const addChild = () => {
      const ownerId = node ? node.id : ownerNode!.id
      const child = newMember()
      onChange(updateNode(root, ownerId, { children: [...findNode(root, ownerId)!.children, child] }))
      select(child.id)
    }
    const addPartner = () => {
      if (!node) return
      const sp = newPartner()
      onChange(updateNode(root, node.id, { spouse: sp }))
      select(sp.id)
    }
    const addSibling = () => {
      if (!node || !parent) return
      const sib = newMember()
      onChange(updateNode(root, parent.id, { children: [...parent.children, sib] }))
      select(sib.id)
    }
    const addParent = () => {
      if (!node) return
      if (node.id === root.id) {
        const newRoot: FamilyMember = { id: genId(), name: '', children: [root] }
        onChange(newRoot)
        select(newRoot.id)
      } else if (parent && !parent.spouse) {
        const sp = newPartner()
        onChange(updateNode(root, parent.id, { spouse: sp }))
        select(sp.id)
      }
    }
    const remove = () => {
      if (isPartner) {
        onChange(mapTree(root, n => (n.spouse?.id === id ? { ...n, spouse: null } : n)))
      } else if (node!.id === root.id) {
        onChange(null)
      } else {
        onChange(removeFromChildren(root, node!.id))
      }
      select(null)
    }
    const toggleSelf = () =>
      onChange(markSelf(root, person.isSelf ? null : id))

    // ---- memorial linking ----
    const linkedId = person.memorialId
    const applyLink = (memorialId: string, suggestedName?: string) => {
      const patch: Partial<FamilyMember> = { memorialId }
      if (!person.name && suggestedName) patch.name = suggestedName
      onChange(isPartner ? updatePartner(root, id, patch) : updateNode(root, id, patch))
      setLinkOpen(false)
      setPasteValue('')
      setPasteError(null)
    }
    const unlink = () =>
      onChange(isPartner ? updatePartner(root, id, { memorialId: undefined }) : updateNode(root, id, { memorialId: undefined }))
    const verifyAndLink = async () => {
      setPasteError(null)
      const m = pasteValue.match(/memorial\/([a-zA-Z0-9]+)/)
      const pid = (m ? m[1] : pasteValue.trim())
      if (!pid) { setPasteError('Introdu un link valid.'); return }
      try {
        const res = await fetch(`/api/memorials/${pid}`)
        if (!res.ok) { setPasteError('Memorial negăsit.'); return }
        const mem = await res.json()
        if (!mem.isPublished) { setPasteError('Memorialul nu este public.'); return }
        applyLink(pid, mem.deceasedName)
      } catch { setPasteError('Memorial negăsit.') }
    }

    const actionBtn = (label: string, enabled: boolean, onClick: () => void) => (
      <button
        type="button"
        disabled={!enabled}
        onClick={onClick}
        className={`${btn} ${enabled ? 'bg-stone-800 text-white hover:bg-stone-900' : 'bg-stone-100 text-stone-300 cursor-not-allowed'}`}
      >
        {label}
      </button>
    )

    return (
      <div
        onClick={e => e.stopPropagation()}
        className="w-64 rounded-xl border border-stone-200 bg-white shadow-lg p-3 text-left"
      >
        <input className={`${inputCls} mb-2`} value={person.name} placeholder="Nume" onChange={e => patchName(e.target.value)} />
        <input className={`${inputCls} mb-2`} value={person.relation ?? ''} placeholder="Relația, ex: Tată" onChange={e => patchRelation(e.target.value)} />
        <label className="flex items-center gap-1.5 text-xs font-medium text-stone-600 mb-3">
          <input type="checkbox" checked={!!person.isSelf} onChange={toggleSelf} className="accent-amber-600" />
          Persoana comemorată
        </label>
        <div className="flex flex-wrap gap-1.5">
          {actionBtn('+ Părinte', canAddParent, addParent)}
          {actionBtn('+ Frate', canAddSibling, addSibling)}
          {actionBtn('+ Copil', canAddChild, addChild)}
          {actionBtn('+ Partener', canAddPartner, addPartner)}
        </div>

        {/* Memorial link */}
        <div className="mt-3 border-t border-stone-100 pt-3">
          {linkedId ? (
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-medium text-green-700">🔗 Memorial legat</span>
              <button type="button" onClick={unlink} className="text-[11px] font-medium text-stone-400 hover:text-red-600 transition-colors">Dezleagă</button>
            </div>
          ) : linkOpen ? (
            <div className="space-y-2">
              {myMemorials && myMemorials.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1">Memorialele mele</p>
                  <div className="max-h-28 overflow-y-auto no-scrollbar space-y-1">
                    {myMemorials.map(m => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => applyLink(m.id, m.deceasedName)}
                        className="w-full text-left px-2 py-1.5 rounded-md text-xs text-stone-700 hover:bg-stone-100 transition-colors"
                      >
                        {m.deceasedName || 'Fără nume'}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1">Am un link</p>
                <input
                  className={inputCls}
                  value={pasteValue}
                  placeholder="Lipește linkul memorialului"
                  onChange={e => setPasteValue(e.target.value)}
                />
                {pasteError && <p className="text-[11px] text-red-600 mt-1">{pasteError}</p>}
                <button type="button" onClick={verifyAndLink} className={`${btn} mt-2 bg-stone-800 text-white hover:bg-stone-900`}>Leagă</button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => { setLinkOpen(true); loadMyMemorials() }}
              className="text-[11px] font-bold text-amber-700 hover:text-amber-800 transition-colors"
            >
              🔗 Leagă de un memorial
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={remove}
          className="mt-3 w-full text-[11px] font-medium text-red-600 hover:text-red-700 transition-colors"
        >
          {!isPartner && node!.id === root.id ? 'Șterge arborele' : 'Șterge'}
        </button>
      </div>
    )
  }

  return (
    <div onClick={() => select(null)}>
      <p className="text-xs text-stone-400 mb-3">
        Apasă pe o persoană pentru a o edita și a adăuga părinți, frați, copii sau un partener.
      </p>
      <div onClick={e => e.stopPropagation()} className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
        <FamilyTree
          tree={root}
          colors={getTheme('clasic').colors}
          selectedId={selectedId ?? undefined}
          onSelect={toggleSelect}
          renderMenu={renderMenu}
        />
      </div>
    </div>
  )
}
