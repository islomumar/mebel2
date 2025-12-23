import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Save, MapPin, Link as LinkIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MapLocationEditorInlineProps {
  onUpdate?: () => void;
}

export function MapLocationEditorInline({ onUpdate }: MapLocationEditorInlineProps) {
  const { toast } = useToast();
  const [mapUrl, setMapUrl] = useState('');
  const [latitude, setLatitude] = useState('41.2911');
  const [longitude, setLongitude] = useState('69.2033');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadMapSettings();
  }, []);

  const loadMapSettings = async () => {
    setIsLoading(true);
    
    const { data, error } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', ['map_latitude', 'map_longitude', 'map_url']);

    if (error) {
      console.error('Error loading map settings:', error);
    } else {
      data?.forEach(item => {
        if (item.key === 'map_latitude' && item.value) setLatitude(item.value);
        if (item.key === 'map_longitude' && item.value) setLongitude(item.value);
        if (item.key === 'map_url' && item.value) setMapUrl(item.value);
      });
    }
    
    setIsLoading(false);
  };

  const extractCoordsFromUrl = (url: string) => {
    // Try to extract coordinates from various Google Maps URL formats
    // Format 1: @41.2911,69.2033
    const atMatch = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (atMatch) {
      return { lat: atMatch[1], lng: atMatch[2] };
    }
    
    // Format 2: !3d41.2911!4d69.2033
    const embedMatch = url.match(/!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/);
    if (embedMatch) {
      return { lat: embedMatch[1], lng: embedMatch[2] };
    }
    
    // Format 3: q=41.2911,69.2033
    const queryMatch = url.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (queryMatch) {
      return { lat: queryMatch[1], lng: queryMatch[2] };
    }

    // Format 4: ll=41.2911,69.2033
    const llMatch = url.match(/ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (llMatch) {
      return { lat: llMatch[1], lng: llMatch[2] };
    }

    // Format 5: place/.../@41.2911,69.2033
    const placeMatch = url.match(/place\/[^@]*@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (placeMatch) {
      return { lat: placeMatch[1], lng: placeMatch[2] };
    }

    return null;
  };

  const handleUrlChange = (url: string) => {
    setMapUrl(url);
    
    const coords = extractCoordsFromUrl(url);
    if (coords) {
      setLatitude(coords.lat);
      setLongitude(coords.lng);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const settings = [
        { key: 'map_latitude', value: latitude },
        { key: 'map_longitude', value: longitude },
        { key: 'map_url', value: mapUrl },
      ];

      for (const setting of settings) {
        const { data: existing } = await supabase
          .from('site_settings')
          .select('id')
          .eq('key', setting.key)
          .maybeSingle();

        if (existing) {
          await supabase
            .from('site_settings')
            .update({ value: setting.value })
            .eq('key', setting.key);
        } else {
          await supabase
            .from('site_settings')
            .insert([setting]);
        }
      }

      toast({
        title: 'Muvaffaqiyat',
        description: 'Xarita joylashuvi saqlandi',
      });
      
      onUpdate?.();
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: 'Xatolik',
        description: 'Saqlashda xatolik yuz berdi',
        variant: 'destructive',
      });
    }

    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="bg-card border border-primary/20 rounded-xl p-4 shadow-lg space-y-4">
      <div className="flex items-center gap-2 text-primary">
        <MapPin className="h-5 w-5" />
        <span className="font-semibold">Xarita joylashuvini o'zgartirish</span>
      </div>
      
      <div className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="map-url" className="flex items-center gap-2 text-sm">
            <LinkIcon className="h-4 w-4" />
            Google Maps havolasi
          </Label>
          <Input
            id="map-url"
            type="url"
            value={mapUrl}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="https://maps.google.com/... havolasini joylashtiring"
            className="text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Google Maps dan joyni toping va "Share" → "Copy link" orqali havolani nusxalang
          </p>
        </div>

        {latitude && longitude && (
          <div className="text-xs text-muted-foreground bg-secondary/50 rounded-lg px-3 py-2">
            📍 Koordinatalar: {latitude}, {longitude}
          </div>
        )}
      </div>

      <Button 
        onClick={handleSave} 
        disabled={isSaving}
        size="sm"
        className="w-full"
      >
        {isSaving ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Saqlanmoqda...
          </>
        ) : (
          <>
            <Save className="h-4 w-4 mr-2" />
            Saqlash
          </>
        )}
      </Button>
    </div>
  );
}
