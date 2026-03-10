'use client';

import React from 'react';
import { useGame } from '@/lib/context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ShopItem } from '@/lib/types';
import { Sword, Shield, Gem, Wand2, Coins, Sparkles, Palette, ShoppingCart, Store } from 'lucide-react';

export default function Shop() {
  const { character, gameState, buyItem } = useGame();

  if (!character || !gameState) return null;

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

  const renderShopItem = (item: ShopItem, isCompact: boolean = false) => {
    const hasEnoughGold = character.gold >= item.price;
    const isCustomization = item.type === 'customization';
    const rarity = rarityColors[item.rarity];
    const alreadyOwned = character.inventory.some(i => i.id === item.id);

    if (isCompact) {
      return (
        <div
          key={item.id}
          className={`flex items-center justify-between p-3 rounded-lg border ${rarity.bg} ${rarity.border}`}
        >
          <div className="flex items-center gap-3 flex-1">
            {React.createElement(itemIcons[item.type] || Sword, { size: 18, className: rarity.text })}
            <div className="min-w-0">
              <div className="font-semibold text-sm truncate">{item.name}</div>
              <div className="text-xs text-muted-foreground">{item.price} Gold</div>
            </div>
          </div>
          {alreadyOwned && <Badge className="bg-secondary/20 text-secondary">Owned</Badge>}
        </div>
      );
    }

    return (
      <Card key={item.id} className={`overflow-hidden hover:border-primary/50 transition-colors ${
        isCustomization ? 'border-accent/50' : ''
      }`}>
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

          {/* Properties */}
          <div className="text-sm space-y-1">
            {isCustomization && item.customization && (
              <div className="text-muted-foreground">
                Category: <span className="text-foreground font-semibold capitalize">{item.customization.category}</span>
              </div>
            )}
            {item.stats && (
              <div className={`space-y-1 p-3 rounded-lg ${rarity.bg} ${rarity.border} border`}>
                {item.stats.strength && <div className={`${rarity.text}`}>+{item.stats.strength} Strength</div>}
                {item.stats.endurance && <div className={`${rarity.text}`}>+{item.stats.endurance} Endurance</div>}
                {item.stats.wisdom && <div className={`${rarity.text}`}>+{item.stats.wisdom} Wisdom</div>}
                {item.stats.agility && <div className={`${rarity.text}`}>+{item.stats.agility} Agility</div>}
              </div>
            )}
          </div>

          {/* Ownership Status */}
          {alreadyOwned && (
            <div className="bg-secondary/10 border border-secondary/30 rounded-lg p-2 text-center">
              <div className="text-xs font-semibold text-secondary">✓ You own this item</div>
            </div>
          )}

          {/* Price & Buy Button */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex items-center gap-2">
              <Coins size={18} className="text-primary" />
              <span className="font-bold text-lg">{item.price}</span>
            </div>
            <Button
              onClick={() => buyItem(item.id)}
              disabled={!hasEnoughGold || alreadyOwned}
              className={`gap-1 ${
                hasEnoughGold && !alreadyOwned
                  ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
              size="sm"
            >
              <ShoppingCart className="h-4 w-4" />
              {alreadyOwned ? 'Owned' : hasEnoughGold ? 'Buy' : 'No Gold'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Count items by type
  const equipmentItems = gameState.shopInventory.filter(i => ['weapon', 'armor', 'accessory'].includes(i.type));
  const customizationItems = gameState.shopInventory.filter(i => i.type === 'customization');
  const consumableItems = gameState.shopInventory.filter(i => i.type === 'consumable');

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/30">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <Store className="w-8 h-8" />
                Merchant's Bazaar
              </h1>
              <p className="text-muted-foreground mt-1">Gear up for your legendary adventures with magical equipment</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2 bg-primary/20 border border-primary/30 rounded-lg px-4 py-3">
                <Coins size={24} className="text-primary" />
                <div>
                  <div className="text-xs text-muted-foreground">Treasure Purse</div>
                  <span className="text-2xl font-bold text-primary">{character.gold}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shop Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Wares ({gameState.shopInventory.length})</TabsTrigger>
          <TabsTrigger value="equipment">Battle Gear ({equipmentItems.length})</TabsTrigger>
          <TabsTrigger value="customization">Legendary Items ({customizationItems.length})</TabsTrigger>
          <TabsTrigger value="consumables">Potions ({consumableItems.length})</TabsTrigger>
        </TabsList>

        {/* All Items */}
        <TabsContent value="all" className="space-y-4">
          {gameState.shopInventory.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center py-12 text-muted-foreground">
                <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>The merchant is restocking! Return soon for legendary treasures!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {gameState.shopInventory.map(item => renderShopItem(item))}
            </div>
          )}
        </TabsContent>

        {/* Equipment */}
        <TabsContent value="equipment" className="space-y-4">
          <div className="space-y-6">
            {/* Weapons */}
            {gameState.shopInventory.filter(i => i.type === 'weapon').length > 0 && (
              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Sword className="h-5 w-5 text-primary" />
                  Weapons
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {gameState.shopInventory.filter(i => i.type === 'weapon').map(item => renderShopItem(item))}
                </div>
              </div>
            )}

            {/* Armor */}
            {gameState.shopInventory.filter(i => i.type === 'armor').length > 0 && (
              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-secondary" />
                  Armor
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {gameState.shopInventory.filter(i => i.type === 'armor').map(item => renderShopItem(item))}
                </div>
              </div>
            )}

            {/* Accessories */}
            {gameState.shopInventory.filter(i => i.type === 'accessory').length > 0 && (
              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Gem className="h-5 w-5 text-accent-foreground" />
                  Accessories
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {gameState.shopInventory.filter(i => i.type === 'accessory').map(item => renderShopItem(item))}
                </div>
              </div>
            )}

            {equipmentItems.length === 0 && (
              <Card>
                <CardContent className="pt-6 text-center py-12 text-muted-foreground">
                  <Sword className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>No equipment available right now!</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Customizations */}
        <TabsContent value="customization" className="space-y-4">
          {customizationItems.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center py-12 text-muted-foreground">
                <Palette className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>No customizations available. Check back later!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {customizationItems.map(item => renderShopItem(item))}
            </div>
          )}
        </TabsContent>

        {/* Consumables */}
        <TabsContent value="consumables" className="space-y-4">
          {consumableItems.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center py-12 text-muted-foreground">
                <Wand2 className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>No consumables available right now!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {consumableItems.map(item => renderShopItem(item))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
