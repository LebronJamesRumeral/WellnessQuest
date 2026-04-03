'use client';

import React from 'react';
import { useGame } from '@/lib/context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { InventoryItem, Customization } from '@/lib/types';
import { Sword, Shield, Gem, Wand2, Sparkles, Clock, Backpack, Package, ShieldCheck } from 'lucide-react';

interface InventoryProps {
  fullView?: boolean;
}

export default function Inventory({ fullView = false }: InventoryProps) {
  const { character, gameState, equipItem, unequipItem, equipCustomization, unequipCustomization, useConsumable } = useGame();

  if (!character) return null;

  const itemIcons: Record<string, React.ComponentType<{ size: number; className: string }>> = {
    weapon: Sword,
    armor: Shield,
    accessory: Gem,
    consumable: Wand2,
    customization: Sparkles,
  };

  const rarityColors: Record<string, { bg: string; text: string; border: string }> = {
    common: { bg: 'bg-muted/60', text: 'text-muted-foreground', border: 'border-border' },
    uncommon: { bg: 'bg-secondary/10', text: 'text-secondary', border: 'border-secondary/30' },
    rare: { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/30' },
    epic: { bg: 'bg-accent/20', text: 'text-accent', border: 'border-accent/40' },
    legendary: { bg: 'bg-primary/20', text: 'text-primary', border: 'border-primary/40' },
  };

  // Get customization details from shop inventory
  const getCustomizationDetails = (customizationId: string): Customization | null => {
    if (!gameState) return null;
    const item = gameState.shopInventory.find(i => i.id === customizationId);
    return item?.customization || null;
  };

  const renderItemCard = (item: InventoryItem, isCompact: boolean = false) => {
    const isCustomization = item.type === 'customization';
    const customization = isCustomization ? getCustomizationDetails(item.id) : null;
    const rarity = rarityColors[item.rarity];
    const isEquipped = 
      (item.type === 'weapon' && character.equippedItems?.weapon === item.id) ||
      (item.type === 'armor' && character.equippedItems?.armor === item.id) ||
      (item.type === 'accessory' && character.equippedItems?.accessory === item.id) ||
      (isCustomization && customization && character.equippedCustomizations?.[customization.category as keyof import('../lib/types').EquippedCustomizations] === item.id);

    if (isCompact) {
      return (
        <div key={item.id} className="space-y-2">
          <div
            className={`flex items-center justify-between p-3 rounded-lg border ${rarity.bg} ${rarity.border}`}
          >
            <div className="flex items-center gap-3 flex-1">
              {React.createElement(itemIcons[item.type] || Sword, { size: 18, className: rarity.text })}
              <div className="min-w-0">
                <div className="font-semibold text-sm truncate">{item.name}</div>
                <div className="text-xs text-muted-foreground">{item.type}</div>
              </div>
            </div>
            {isEquipped && <Badge className="bg-primary/20 text-primary-foreground gap-1">✓ Equipped</Badge>}
          </div>
          {/* Compact Buffs Display */}
          {item.buffs && (
            <div className={`text-xs space-y-0.5 p-2 rounded border border-accent/20 bg-accent/5 ml-1 text-accent`}>
              {item.buffs.xpMultiplier && item.buffs.xpMultiplier > 1 && (
                <div>⚡ +{Math.round((item.buffs.xpMultiplier - 1) * 100)}% XP</div>
              )}
              {item.buffs.goldMultiplier && item.buffs.goldMultiplier > 1 && (
                <div>💰 +{Math.round((item.buffs.goldMultiplier - 1) * 100)}% Gold</div>
              )}
              {item.buffs.speedBoost && item.buffs.speedBoost > 0 && (
                <div>⚡ +{item.buffs.speedBoost}% Speed</div>
              )}
              {item.buffs.accuracyBoost && item.buffs.accuracyBoost > 0 && (
                <div>🎯 +{item.buffs.accuracyBoost}% Accuracy</div>
              )}
            </div>
          )}
        </div>
      );
    }

    return (
      <Card key={item.id} className={`overflow-hidden ${isEquipped ? 'ring-2 ring-primary' : ''}`}>
        <CardContent className="pt-6 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1">
              <div className={`p-3 rounded-lg ${rarity.bg} flex-shrink-0`}>
                {React.createElement(itemIcons[item.type] || Sword, { size: 24, className: rarity.text })}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">{item.name}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-bold border ${rarity.bg} ${rarity.text} ${rarity.border}`}>
              {item.rarity.toUpperCase()}
            </div>
          </div>

          {/* Stats */}
          {item.stats && (
            <div className={`text-sm space-y-1 p-3 rounded-lg ${rarity.bg} ${rarity.border} border`}>
              {item.stats.strength && <div className={`${rarity.text}`}>+{item.stats.strength} Strength</div>}
              {item.stats.endurance && <div className={`${rarity.text}`}>+{item.stats.endurance} Endurance</div>}
              {item.stats.wisdom && <div className={`${rarity.text}`}>+{item.stats.wisdom} Wisdom</div>}
              {item.stats.agility && <div className={`${rarity.text}`}>+{item.stats.agility} Agility</div>}
            </div>
          )}

          {/* Buffs */}
          {item.buffs && (
            <div className={`text-sm space-y-1 p-3 rounded-lg border border-accent/30 bg-accent/5`}>
              <div className="font-semibold text-accent mb-2">⚡ Gameplay Bonuses</div>
              {item.buffs.xpMultiplier && item.buffs.xpMultiplier > 1 && (
                <div className="text-accent">+{Math.round((item.buffs.xpMultiplier - 1) * 100)}% XP Gain</div>
              )}
              {item.buffs.goldMultiplier && item.buffs.goldMultiplier > 1 && (
                <div className="text-accent">+{Math.round((item.buffs.goldMultiplier - 1) * 100)}% Gold Rewards</div>
              )}
              {item.buffs.speedBoost && item.buffs.speedBoost > 0 && (
                <div className="text-accent">+{item.buffs.speedBoost}% Game Speed</div>
              )}
              {item.buffs.accuracyBoost && item.buffs.accuracyBoost > 0 && (
                <div className="text-accent">+{item.buffs.accuracyBoost}% Accuracy</div>
              )}
            </div>
          )}

          {/* Status Badge */}
          {isEquipped && (
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-2 text-center">
              <div className="text-xs font-semibold text-primary">✓ Currently Equipped</div>
            </div>
          )}

          {/* Actions */}
          {fullView && item.quantity && (
            <div className="text-sm text-muted-foreground">
              <Clock className="h-4 w-4 inline mr-1" />
              Quantity: {item.quantity}
            </div>
          )}

          {fullView && (
            <div className="flex gap-2 pt-2">
              {item.type === 'consumable' && (
                <Button
                  onClick={() => useConsumable(item.id)}
                  size="sm"
                  className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground gap-1"
                >
                  Use
                </Button>
              )}
              {(item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory') && (
                <>
                  {isEquipped ? (
                    <Button
                      onClick={() => unequipItem(item.type as 'weapon' | 'armor' | 'accessory')}
                      size="sm"
                      className="flex-1 bg-muted hover:bg-muted/90 text-foreground"
                    >
                      Unequip
                    </Button>
                  ) : (
                    <Button
                      onClick={() => equipItem(item.id, item.type as 'weapon' | 'armor' | 'accessory')}
                      size="sm"
                      className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      Equip
                    </Button>
                  )}
                </>
              )}
              {item.type === 'customization' && customization && (
                <>
                  {isEquipped ? (
                    <Button
                      onClick={() => {
                        const category = customization.category as keyof import('../lib/types').EquippedCustomizations;
                        unequipCustomization(category);
                      }}
                      size="sm"
                      className="flex-1 bg-muted hover:bg-muted/90 text-foreground"
                    >
                      Unequip
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        const category = customization.category as keyof import('../lib/types').EquippedCustomizations;
                        equipCustomization(item.id, category);
                      }}
                      size="sm"
                      className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
                    >
                      Equip
                    </Button>
                  )}
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const equipmentItems = character.inventory.filter(i => ['weapon', 'armor', 'accessory'].includes(i.type));
  const customizationItems = character.inventory.filter(i => i.type === 'customization');
  const consumableItems = character.inventory.filter(i => i.type === 'consumable');
  const equippedCount = Object.values(character.equippedItems || {}).filter(Boolean).length;

  const renderEmptyState = (icon: React.ComponentType<{ className?: string }>, message: string) => (
    <Card>
      <CardContent className="pt-6 text-center py-12 text-muted-foreground">
        {React.createElement(icon, { className: 'h-12 w-12 mx-auto mb-3 opacity-20' })}
        <p>{message}</p>
      </CardContent>
    </Card>
  );

  if (fullView) {
    return (
      <div className="space-y-6">
        {/* Backpack Overview */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Backpack className="h-5 w-5 text-primary" />
              Backpack Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="rounded-lg border border-border bg-background/80 p-3">
                <div className="text-xs text-muted-foreground">Total Items</div>
                <div className="text-xl font-bold text-foreground">{character.inventory.length}</div>
              </div>
              <div className="rounded-lg border border-border bg-background/80 p-3">
                <div className="text-xs text-muted-foreground">Equipped</div>
                <div className="text-xl font-bold text-primary">{equippedCount} / 3</div>
              </div>
              <div className="rounded-lg border border-border bg-background/80 p-3">
                <div className="text-xs text-muted-foreground">Equipment</div>
                <div className="text-xl font-bold text-secondary">{equipmentItems.length}</div>
              </div>
              <div className="rounded-lg border border-border bg-background/80 p-3">
                <div className="text-xs text-muted-foreground">Consumables</div>
                <div className="text-xl font-bold text-accent">{consumableItems.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid xl:grid-cols-3 gap-6 items-start">
          {/* Equipped Items */}
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Currently Equipped ({equippedCount} / 3)
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4">
            <div className={`rounded-lg p-4 border-2 space-y-3 ${character.equippedItems?.weapon ? 'border-primary/50 bg-primary/10' : 'border-border bg-muted/30'}`}>
              <div className="flex items-center gap-2">
                <Sword size={20} className={character.equippedItems?.weapon ? 'text-primary' : 'text-muted-foreground'} />
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase">Weapon</div>
                  {character.equippedItems?.weapon && (
                    <span className="text-sm font-semibold text-foreground block mt-1">
                      {character.inventory.find(i => i.id === character.equippedItems?.weapon)?.name}
                    </span>
                  )}
                </div>
              </div>
              {character.equippedItems?.weapon ? (
                <Button
                  onClick={() => unequipItem('weapon')}
                  size="sm"
                  className="w-full bg-muted hover:bg-muted/90 text-foreground"
                >
                  Unequip
                </Button>
              ) : (
                <div className="text-sm text-muted-foreground">Empty</div>
              )}
            </div>

            <div className={`rounded-lg p-4 border-2 space-y-3 ${character.equippedItems?.armor ? 'border-secondary/50 bg-secondary/10' : 'border-border bg-muted/30'}`}>
              <div className="flex items-center gap-2">
                <Shield size={20} className={character.equippedItems?.armor ? 'text-secondary' : 'text-muted-foreground'} />
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase">Armor</div>
                  {character.equippedItems?.armor && (
                    <span className="text-sm font-semibold text-foreground block mt-1">
                      {character.inventory.find(i => i.id === character.equippedItems?.armor)?.name}
                    </span>
                  )}
                </div>
              </div>
              {character.equippedItems?.armor ? (
                <Button
                  onClick={() => unequipItem('armor')}
                  size="sm"
                  className="w-full bg-muted hover:bg-muted/90 text-foreground"
                >
                  Unequip
                </Button>
              ) : (
                <div className="text-sm text-muted-foreground">Empty</div>
              )}
            </div>

            <div className={`rounded-lg p-4 border-2 space-y-3 ${character.equippedItems?.accessory ? 'border-accent/50 bg-accent/10' : 'border-border bg-muted/30'}`}>
              <div className="flex items-center gap-2">
                <Gem size={20} className={character.equippedItems?.accessory ? 'text-accent' : 'text-muted-foreground'} />
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase">Accessory</div>
                  {character.equippedItems?.accessory && (
                    <span className="text-sm font-semibold text-foreground block mt-1">
                      {character.inventory.find(i => i.id === character.equippedItems?.accessory)?.name}
                    </span>
                  )}
                </div>
              </div>
              {character.equippedItems?.accessory ? (
                <Button
                  onClick={() => unequipItem('accessory')}
                  size="sm"
                  className="w-full bg-muted hover:bg-muted/90 text-foreground"
                >
                  Unequip
                </Button>
              ) : (
                <div className="text-sm text-muted-foreground">Empty</div>
              )}
            </div>
            </CardContent>
          </Card>

          {/* Active Buffs Summary */}
          <Card className="border-accent/30 bg-accent/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-accent">
                <Sparkles className="h-5 w-5" />
                Active Bonuses
              </CardTitle>
            </CardHeader>
            <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {(() => {
                const equippedItemIds = Object.values(character.equippedItems || {}).filter(Boolean) as string[];
                if (equippedItemIds.length === 0) {
                  return <p className="text-muted-foreground col-span-2">Equip items above to activate bonuses</p>;
                }

                let totalXpMult = 1;
                let totalGoldMult = 1;
                let totalSpeed = 0;
                let totalAccuracy = 0;
                const equippedItemNames: string[] = [];

                equippedItemIds.forEach(itemId => {
                  const item = character.inventory.find(i => i.id === itemId);
                  if (item && item.buffs) {
                    totalXpMult *= item.buffs.xpMultiplier || 1;
                    totalGoldMult *= item.buffs.goldMultiplier || 1;
                    totalSpeed += item.buffs.speedBoost || 0;
                    totalAccuracy += item.buffs.accuracyBoost || 0;
                    equippedItemNames.push(item.name);
                  }
                });

                return (
                  <>
                    <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                      <div className="text-xs font-semibold text-primary mb-2">EQUIPPED ITEMS</div>
                      <div className="space-y-1">
                        {equippedItemNames.map((name, i) => (
                          <div key={i} className="text-sm text-foreground">✓ {name}</div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20">
                      <div className="text-xs font-semibold text-accent mb-3">TOTAL BONUSES</div>
                      <div className="space-y-2 text-sm">
                        {totalXpMult > 1 && (
                          <div className="text-accent font-semibold">
                            ⭐ +{Math.round((totalXpMult - 1) * 100)}% XP Gain
                          </div>
                        )}
                        {totalGoldMult > 1 && (
                          <div className="text-accent font-semibold">
                            💰 +{Math.round((totalGoldMult - 1) * 100)}% Gold Rewards
                          </div>
                        )}
                        {totalSpeed > 0 && (
                          <div className="text-accent font-semibold">
                            ⚡ +{totalSpeed}% Game Speed
                          </div>
                        )}
                        {totalAccuracy > 0 && (
                          <div className="text-accent font-semibold">
                            🎯 +{totalAccuracy}% Accuracy
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
            </CardContent>
          </Card>
        </div>

        {/* Item Library */}
        <Tabs
          defaultValue="all"
          className="space-y-4"
          onValueChange={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-2 h-auto p-1">
            <TabsTrigger value="all">All ({character.inventory.length})</TabsTrigger>
            <TabsTrigger value="equipment">Equipment ({equipmentItems.length})</TabsTrigger>
            <TabsTrigger value="customization">Cosmetics ({customizationItems.length})</TabsTrigger>
            <TabsTrigger value="consumables">Consumables ({consumableItems.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {character.inventory.length === 0 ? (
              renderEmptyState(Package, 'No items yet. Visit the shop to get started!')
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {character.inventory.map(item => renderItemCard(item))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="equipment" className="space-y-4">
            {equipmentItems.length === 0 ? (
              renderEmptyState(Sword, 'No equipment items. Buy some gear from the shop!')
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {equipmentItems.map(item => renderItemCard(item))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="customization" className="space-y-4">
            {customizationItems.length === 0 ? (
              renderEmptyState(Sparkles, 'No customizations yet. Find cosmetic items in the shop!')
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {customizationItems.map(item => renderItemCard(item))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="consumables" className="space-y-4">
            {consumableItems.length === 0 ? (
              renderEmptyState(Wand2, 'No consumables. Get some potions and power-ups!')
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {consumableItems.map(item => renderItemCard(item))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // Mini view for dashboard
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Inventory</span>
          <Badge variant="secondary">{character.inventory.length} items</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {character.inventory.length === 0 ? (
          <p className="text-muted-foreground text-center py-6 text-sm">Empty. Visit the shop!</p>
        ) : (
          <div className="space-y-2">
            {character.inventory.slice(0, 3).map(item => renderItemCard(item, true))}
            {character.inventory.length > 3 && (
              <div className="text-sm text-muted-foreground text-center pt-2">
                +{character.inventory.length - 3} more items
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

