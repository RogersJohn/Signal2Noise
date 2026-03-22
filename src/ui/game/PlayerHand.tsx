import React from 'react';
import { EvidenceCard } from '../../engine/types';

interface PlayerHandProps {
  cards: EvidenceCard[];
  selectedCardId: string | null;
  onSelectCard: (cardId: string) => void;
  disabled: boolean;
}

export default function PlayerHand({ cards, selectedCardId, onSelectCard, disabled }: PlayerHandProps) {
  if (cards.length === 0) {
    return (
      <div style={styles.container}>
        <h3 style={styles.title}>YOUR HAND (0)</h3>
        <p style={styles.emptyMsg}>Hand empty — draw cards at end of round</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h3 data-testid="hand-title" style={styles.title}>YOUR HAND ({cards.length})</h3>
      <div style={styles.cardList}>
        {cards.map(card => {
          const isSelected = selectedCardId === card.id;
          const isDimmed = selectedCardId !== null && !isSelected;
          return (
            <button
              key={card.id}
              data-testid={`hand-card-${card.id}`}
              style={{
                ...styles.card,
                ...(isSelected ? styles.selected : {}),
                ...(isDimmed ? styles.otherDimmed : {}),
                ...(disabled ? styles.disabled : {}),
              }}
              onClick={() => !disabled && onSelectCard(isSelected ? '' : card.id)}
              disabled={disabled}
            >
              <div style={styles.cardName}>{card.name}</div>
              <div style={card.specific ? styles.typeSpecific : styles.typeGeneric}>
                {card.specific ? '🎯 SPECIFIC' : '📋 GENERIC'}
              </div>
              <div style={styles.cardTargets}>
                {card.targets.includes('ALL') ? 'Supports: ALL' : `Supports: ${card.targets.join(', ')}`}
              </div>
              <div style={styles.flavorText}>{card.flavorText}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { padding: '8px' },
  title: { color: '#0f0', fontFamily: 'monospace', fontSize: '14px', margin: '0 0 8px' },
  emptyMsg: { color: '#666', fontFamily: 'monospace', fontSize: '12px', fontStyle: 'italic' },
  cardList: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  card: {
    background: '#1a1a2e', border: '1px solid #333', borderRadius: '4px', padding: '8px',
    width: '180px', cursor: 'pointer', textAlign: 'left', fontFamily: 'monospace',
    color: '#ccc', fontSize: '11px', transition: 'all 0.2s',
  },
  selected: { border: '2px solid #0f0', background: '#1a2a1a', transform: 'scale(1.03)' },
  otherDimmed: { opacity: 0.5 },
  disabled: { opacity: 0.5, cursor: 'not-allowed' },
  cardName: { fontWeight: 'bold', color: '#fff', marginBottom: '4px', fontSize: '12px' },
  typeSpecific: { color: '#fa0', marginBottom: '2px' },
  typeGeneric: { color: '#888', marginBottom: '2px' },
  cardTargets: { color: '#666', marginBottom: '4px', fontSize: '10px' },
  flavorText: { fontStyle: 'italic', color: '#555', fontSize: '10px' },
};
