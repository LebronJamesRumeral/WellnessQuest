'use client';

import React from 'react';
import { Character, Customization } from '@/lib/types';
import { useGame } from '@/lib/context';

interface CharacterPreviewProps {
  character: Character;
}

export default function CharacterPreview({ character }: CharacterPreviewProps) {
  const { gameState } = useGame();

  // Get customization details from shop inventory
  const getCustomizationDetails = (customizationId: string): Customization | null => {
    if (!gameState) return null;
    const item = gameState.shopInventory.find(i => i.id === customizationId);
    return item?.customization || null;
  };

  // Get equipped item details
  const getEquippedItemName = (itemId: string | undefined): string | null => {
    if (!itemId || !character) return null;
    const item = character.inventory.find(i => i.id === itemId);
    return item ? item.name : null;
  };

  // Handle undefined equippedCustomizations for backwards compatibility
  const customizations = character.equippedCustomizations || {};

  const equippedArmorColor = customizations.armorColor;
  const equippedHelmet = customizations.helmet;
  const equippedCloak = customizations.cloak;
  const equippedAura = customizations.aura;

  // Get equipped items
  const equippedWeapon = character.equippedItems?.weapon;
  const equippedArmor = character.equippedItems?.armor;
  const equippedAccessory = character.equippedItems?.accessory;

  const weaponName = getEquippedItemName(equippedWeapon);
  const armorName = getEquippedItemName(equippedArmor);
  const accessoryName = getEquippedItemName(equippedAccessory);

  const armorColorCustomization = equippedArmorColor ? getCustomizationDetails(equippedArmorColor) : null;
  const helmetCustomization = equippedHelmet ? getCustomizationDetails(equippedHelmet) : null;
  const cloakCustomization = equippedCloak ? getCustomizationDetails(equippedCloak) : null;
  const auraCustomization = equippedAura ? getCustomizationDetails(equippedAura) : null;

  const armorColor = armorColorCustomization?.visual.color || '#4b5563'; // Default gray
  const helmetColor = helmetCustomization?.visual.color || 'none';
  const cloakColor = cloakCustomization?.visual.color || 'none';
  const auraColor = auraCustomization?.visual.color || 'none';

  return (
    <div className="bg-card border border-border rounded-lg p-8 space-y-6">
      <div className="flex flex-col items-center justify-center min-h-96">
        {/* Character Container */}
        <div className="relative w-48 h-full flex items-center justify-center">
          {/* Aura Effect */}
          {auraCustomization && (
            <div
              className="absolute inset-0 rounded-full opacity-30 blur-2xl animate-pulse"
              style={{ backgroundColor: auraColor }}
            />
          )}

          {/* Character SVG */}
          <svg
            viewBox="0 0 200 300"
            width="200"
            height="300"
            className="relative z-10"
          >
            {/* Cloak */}
            {cloakCustomization && (
              <>
                <ellipse cx="100" cy="120" rx="60" ry="80" fill={cloakColor} opacity="0.8" />
                <path
                  d="M 50 100 Q 30 150 40 200 Q 100 220 160 200 Q 170 150 150 100"
                  fill={cloakColor}
                  opacity="0.6"
                />
              </>
            )}

            {/* Body (Armor) */}
            <rect x="60" y="90" width="80" height="70" rx="10" fill={armorColor} />
            {equippedArmor && (
              <text x="100" y="130" textAnchor="middle" fill="#fbbf24" fontSize="10" fontWeight="bold">
                ⚔
              </text>
            )}

            {/* Arms */}
            <ellipse cx="40" cy="110" rx="15" ry="40" fill={armorColor} opacity="0.8" />
            <ellipse cx="160" cy="110" rx="15" ry="40" fill={armorColor} opacity="0.8" />

            {/* Weapon in right hand */}
            {equippedWeapon && (
              <>
                {/* Sword */}
                <rect x="165" y="70" width="8" height="35" fill="#8b7355" />
                <polygon points="169,70 166,65 172,65" fill="#c0a080" />
                <rect x="165" y="105" width="8" height="8" fill="#fbbf24" />
              </>
            )}

            {/* Helmet */}
            {helmetCustomization ? (
              <>
                <circle cx="100" cy="50" r="35" fill={helmetColor} />
                <path d="M 75 50 L 70 30 Q 100 20 130 30 L 125 50" fill={helmetColor} opacity="0.7" />
              </>
            ) : (
              <circle cx="100" cy="50" r="35" fill="#8b7355" />
            )}

            {/* Face */}
            <circle cx="95" cy="45" r="4" fill="#fdbf59" />
            <circle cx="105" cy="45" r="4" fill="#fdbf59" />
            <path d="M 100 55 Q 95 60 100 62 Q 105 60 100 55" fill="#000" />

            {/* Accessory indicator (halo/glow around head) */}
            {equippedAccessory && (
              <circle cx="100" cy="50" r="40" fill="none" stroke="#fbbf24" strokeWidth="2" opacity="0.6" />
            )}

            {/* Legs */}
            <rect x="75" y="160" width="15" height="50" fill="#5a4a3a" />
            <rect x="110" y="160" width="15" height="50" fill="#5a4a3a" />

            {/* Boots */}
            <rect x="75" y="210" width="15" height="15" fill="#2d2d2d" rx="2" />
            <rect x="110" y="210" width="15" height="15" fill="#2d2d2d" rx="2" />
          </svg>
        </div>

        {/* Equipment and Customization Info */}
        <div className="mt-6 text-center space-y-3 w-full">
          <h3 className="text-xl font-bold text-foreground">{character.name}</h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {weaponName && (
              <div className="text-xs bg-input px-3 py-1 rounded border border-border">
                <span className="text-muted-foreground">Weapon:</span>{' '}
                <span className="text-primary font-semibold">{weaponName}</span>
              </div>
            )}
            {armorName && (
              <div className="text-xs bg-input px-3 py-1 rounded border border-border">
                <span className="text-muted-foreground">Armor:</span>{' '}
                <span className="text-primary font-semibold">{armorName}</span>
              </div>
            )}
            {accessoryName && (
              <div className="text-xs bg-input px-3 py-1 rounded border border-border">
                <span className="text-muted-foreground">Accessory:</span>{' '}
                <span className="text-primary font-semibold">{accessoryName}</span>
              </div>
            )}
            {armorColorCustomization && (
              <div className="text-xs bg-input px-3 py-1 rounded border border-border">
                <span className="text-muted-foreground">Armor Color:</span>{' '}
                <span className="text-primary font-semibold">{armorColorCustomization.name}</span>
              </div>
            )}
            {helmetCustomization && (
              <div className="text-xs bg-input px-3 py-1 rounded border border-border">
                <span className="text-muted-foreground">Helmet:</span>{' '}
                <span className="text-primary font-semibold">{helmetCustomization.name}</span>
              </div>
            )}
            {cloakCustomization && (
              <div className="text-xs bg-input px-3 py-1 rounded border border-border">
                <span className="text-muted-foreground">Cloak:</span>{' '}
                <span className="text-primary font-semibold">{cloakCustomization.name}</span>
              </div>
            )}
            {auraCustomization && (
              <div className="text-xs bg-input px-3 py-1 rounded border border-border">
                <span className="text-muted-foreground">Aura:</span>{' '}
                <span className="text-primary font-semibold">{auraCustomization.name}</span>
              </div>
            )}
          </div>

          {/* Stat Bonuses from Equipment and Customizations */}
          {(weaponName || armorName || accessoryName || armorColorCustomization || helmetCustomization || cloakCustomization || auraCustomization) && (
            <div className="text-sm text-muted-foreground pt-4 border-t border-border">
              <p className="font-semibold text-foreground mb-2">Equipment & Customization Bonuses:</p>
              <div className="space-y-1 text-xs">
                {/* Weapon stats */}
                {equippedWeapon && character.inventory.find(i => i.id === equippedWeapon)?.stats && (
                  <>
                    {character.inventory.find(i => i.id === equippedWeapon)?.stats?.strength && (
                      <div>+{character.inventory.find(i => i.id === equippedWeapon)?.stats?.strength} Strength</div>
                    )}
                    {character.inventory.find(i => i.id === equippedWeapon)?.stats?.endurance && (
                      <div>+{character.inventory.find(i => i.id === equippedWeapon)?.stats?.endurance} Endurance</div>
                    )}
                    {character.inventory.find(i => i.id === equippedWeapon)?.stats?.wisdom && (
                      <div>+{character.inventory.find(i => i.id === equippedWeapon)?.stats?.wisdom} Wisdom</div>
                    )}
                    {character.inventory.find(i => i.id === equippedWeapon)?.stats?.agility && (
                      <div>+{character.inventory.find(i => i.id === equippedWeapon)?.stats?.agility} Agility</div>
                    )}
                  </>
                )}
                {/* Armor stats */}
                {equippedArmor && character.inventory.find(i => i.id === equippedArmor)?.stats && (
                  <>
                    {character.inventory.find(i => i.id === equippedArmor)?.stats?.strength && (
                      <div>+{character.inventory.find(i => i.id === equippedArmor)?.stats?.strength} Strength</div>
                    )}
                    {character.inventory.find(i => i.id === equippedArmor)?.stats?.endurance && (
                      <div>+{character.inventory.find(i => i.id === equippedArmor)?.stats?.endurance} Endurance</div>
                    )}
                    {character.inventory.find(i => i.id === equippedArmor)?.stats?.wisdom && (
                      <div>+{character.inventory.find(i => i.id === equippedArmor)?.stats?.wisdom} Wisdom</div>
                    )}
                    {character.inventory.find(i => i.id === equippedArmor)?.stats?.agility && (
                      <div>+{character.inventory.find(i => i.id === equippedArmor)?.stats?.agility} Agility</div>
                    )}
                  </>
                )}
                {/* Accessory stats */}
                {equippedAccessory && character.inventory.find(i => i.id === equippedAccessory)?.stats && (
                  <>
                    {character.inventory.find(i => i.id === equippedAccessory)?.stats?.strength && (
                      <div>+{character.inventory.find(i => i.id === equippedAccessory)?.stats?.strength} Strength</div>
                    )}
                    {character.inventory.find(i => i.id === equippedAccessory)?.stats?.endurance && (
                      <div>+{character.inventory.find(i => i.id === equippedAccessory)?.stats?.endurance} Endurance</div>
                    )}
                    {character.inventory.find(i => i.id === equippedAccessory)?.stats?.wisdom && (
                      <div>+{character.inventory.find(i => i.id === equippedAccessory)?.stats?.wisdom} Wisdom</div>
                    )}
                    {character.inventory.find(i => i.id === equippedAccessory)?.stats?.agility && (
                      <div>+{character.inventory.find(i => i.id === equippedAccessory)?.stats?.agility} Agility</div>
                    )}
                  </>
                )}
                {armorColorCustomization?.stats && (
                  <>
                    {armorColorCustomization.stats.strength && (
                      <div>+{armorColorCustomization.stats.strength} Strength</div>
                    )}
                    {armorColorCustomization.stats.endurance && (
                      <div>+{armorColorCustomization.stats.endurance} Endurance</div>
                    )}
                    {armorColorCustomization.stats.wisdom && (
                      <div>+{armorColorCustomization.stats.wisdom} Wisdom</div>
                    )}
                    {armorColorCustomization.stats.agility && (
                      <div>+{armorColorCustomization.stats.agility} Agility</div>
                    )}
                  </>
                )}
                {helmetCustomization?.stats && (
                  <>
                    {helmetCustomization.stats.strength && (
                      <div>+{helmetCustomization.stats.strength} Strength</div>
                    )}
                    {helmetCustomization.stats.endurance && (
                      <div>+{helmetCustomization.stats.endurance} Endurance</div>
                    )}
                    {helmetCustomization.stats.wisdom && (
                      <div>+{helmetCustomization.stats.wisdom} Wisdom</div>
                    )}
                    {helmetCustomization.stats.agility && (
                      <div>+{helmetCustomization.stats.agility} Agility</div>
                    )}
                  </>
                )}
                {cloakCustomization?.stats && (
                  <>
                    {cloakCustomization.stats.strength && (
                      <div>+{cloakCustomization.stats.strength} Strength</div>
                    )}
                    {cloakCustomization.stats.endurance && (
                      <div>+{cloakCustomization.stats.endurance} Endurance</div>
                    )}
                    {cloakCustomization.stats.wisdom && (
                      <div>+{cloakCustomization.stats.wisdom} Wisdom</div>
                    )}
                    {cloakCustomization.stats.agility && (
                      <div>+{cloakCustomization.stats.agility} Agility</div>
                    )}
                  </>
                )}
                {auraCustomization?.stats && (
                  <>
                    {auraCustomization.stats.strength && (
                      <div>+{auraCustomization.stats.strength} Strength</div>
                    )}
                    {auraCustomization.stats.endurance && (
                      <div>+{auraCustomization.stats.endurance} Endurance</div>
                    )}
                    {auraCustomization.stats.wisdom && (
                      <div>+{auraCustomization.stats.wisdom} Wisdom</div>
                    )}
                    {auraCustomization.stats.agility && (
                      <div>+{auraCustomization.stats.agility} Agility</div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
