import React from 'react';
import WhiteKey from './WhiteKey';
import BlackKey from './BlackKey';

interface OctaveGroupProps {
  octave: number;
  activeKeys: Map<number, number>;
  onPress: (note: number, velocity: number) => void;
  onRelease: (note: number) => void;
  showLabels: boolean;
}

const OctaveGroup: React.FC<OctaveGroupProps> = ({ octave, activeKeys, onPress, onRelease, showLabels }) => {
  const baseNote = (octave + 1) * 12;

  // White keys: C, D, E, F, G, A, B
  const whiteKeyOffsets = [0, 2, 4, 5, 7, 9, 11];
  // Black keys: C#, D#, F#, G#, A#
  const blackKeyOffsets = [1, 3, 6, 8, 10];

  return (
    <div className="flex relative h-full">
      {whiteKeyOffsets.map((offset, index) => {
        const note = baseNote + offset;
        const hasBlackKey = [0, 1, 3, 4, 5].includes(index);
        const blackNote = baseNote + (index === 0 ? 1 : index === 1 ? 3 : index === 3 ? 6 : index === 4 ? 8 : 10);

        return (
          <div key={note} className="relative h-full">
            <WhiteKey
              note={note}
              isPressed={activeKeys.has(note)}
              onPress={onPress}
              onRelease={onRelease}
              showLabel={showLabels}
            />
            {hasBlackKey && (
              <BlackKey
                note={blackNote}
                isPressed={activeKeys.has(blackNote)}
                onPress={onPress}
                onRelease={onRelease}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default OctaveGroup;
