'use client'

import React from 'react'
import type { FamilyMember } from '@/types'
import type { MemorialTheme } from '@/lib/themes'

type ThemeColors = MemorialTheme['colors']

interface FamilyTreeProps {
  tree: FamilyMember
  colors: ThemeColors
  // Optional interactive mode (used by the editor). Read-only callers omit these.
  selectedId?: string
  onSelect?: (id: string) => void
  renderMenu?: (id: string) => React.ReactNode
}

interface CardCtx {
  c: ThemeColors
  selectedId?: string
  onSelect?: (id: string) => void
  renderMenu?: (id: string) => React.ReactNode
}

function PersonCard({
  id, name, relation, self, ctx,
}: { id: string; name: string; relation?: string; self?: boolean; ctx: CardCtx }) {
  const { c, selectedId, onSelect, renderMenu } = ctx
  const interactive = !!onSelect
  const selected = selectedId === id

  const card = (
    <div
      onClick={interactive ? () => onSelect!(id) : undefined}
      style={{
        background: c.surfaceAlt,
        border: self ? `2px solid ${c.tabActive}` : `1px solid ${c.borderAlt}`,
        boxShadow: selected ? `0 0 0 3px ${c.tabActive}` : undefined,
        borderRadius: 12,
        padding: '8px 14px',
        minWidth: 104,
        textAlign: 'center',
        cursor: interactive ? 'pointer' : undefined,
        transition: 'box-shadow 0.15s',
      }}
    >
      <div style={{ fontWeight: 700, fontSize: 13, lineHeight: 1.2, color: self ? c.tabActive : c.text }}>
        {name || 'Fără nume'}
      </div>
      {relation && (
        <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: c.textMuted, marginTop: 2 }}>
          {relation}
        </div>
      )}
    </div>
  )

  // In interactive mode, render the action menu beneath the selected card.
  if (interactive && selected && renderMenu) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {card}
        <div style={{ marginTop: 6 }}>{renderMenu(id)}</div>
      </div>
    )
  }
  return card
}

function TreeNode({ node, ctx }: { node: FamilyMember; ctx: CardCtx }) {
  const children = node.children ?? []
  const { c } = ctx
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Couple row */}
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        <PersonCard id={node.id} name={node.name} relation={node.relation} self={node.isSelf} ctx={ctx} />
        {node.spouse && (
          <>
            <div style={{ width: 18, height: 2, background: c.tabActive, flexShrink: 0, marginTop: 18 }} />
            <PersonCard
              id={node.spouse.id}
              name={node.spouse.name}
              relation={node.spouse.relation}
              self={node.spouse.isSelf}
              ctx={ctx}
            />
          </>
        )}
      </div>

      {children.length > 0 && (
        <>
          <div style={{ width: 2, height: 20, background: c.border }} />
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            {children.map((child, i) => (
              <div
                key={child.id}
                style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 12px' }}
              >
                {children.length > 1 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      height: 2,
                      background: c.border,
                      left: i === 0 ? '50%' : 0,
                      right: i === children.length - 1 ? '50%' : 0,
                    }}
                  />
                )}
                <div style={{ width: 2, height: 20, background: c.border }} />
                <TreeNode node={child} ctx={ctx} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export function FamilyTree({ tree, colors, selectedId, onSelect, renderMenu }: FamilyTreeProps) {
  const ctx: CardCtx = { c: colors, selectedId, onSelect, renderMenu }
  return (
    <div className="overflow-x-auto no-scrollbar pb-2">
      <div style={{ display: 'inline-flex', justifyContent: 'center', minWidth: '100%', padding: '8px 4px' }}>
        <TreeNode node={tree} ctx={ctx} />
      </div>
    </div>
  )
}
