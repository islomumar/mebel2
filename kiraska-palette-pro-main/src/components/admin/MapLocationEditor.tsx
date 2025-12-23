import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Save, MapPin, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MapLocationEditorProps {
  className?: string;
}

export function MapLocationEditor({ className }: MapLocationEditorProps) {
  const { toast } = useToast();
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
      .in('key', ['map_latitude', 'map_longitude']);

    if (error) {
      console.error('Error loading map settings:', error);
    } else {
      data?.forEach(item => {
        if (item.key === 'map_latitude' && item.value) {
          setLatitude(item.value);
        }
        if (item.key === 'map_longitude' && item.value) {
          setLongitude(item.value);
        }
      });
    }
    
    setIsLoading(false);
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      // Save latitude
      const { data: existingLat } = await supabase
        .from('site_settings')
        .select('id')
        .eq('key', 'map_latitude')
        .maybeSingle();

      if (existingLat) {
        await supabase
          .from('site_settings')
          .update({ value: latitude })
          .eq('key', 'map_latitude');
      } else {
        await supabase
          .from('site_settings')
          .insert([{ key: 'map_latitude', value: latitude }]);
      }

      // Save longitude
      const { data: existingLng } = await supabase
        .from('site_settings')
        .select('id')
        .eq('key', 'map_longitude')
        .maybeSingle();

      if (existingLng) {
        await supabase
          .from('site_settings')
          .update({ value: longitude })
          .eq('key', 'map_longitude');
      } else {
        await supabase
          .from('site_settings')
          .insert([{ key: 'map_longitude', value: longitude }]);
      }

      toast({
        title: 'Muvaffaqiyat',
        description: 'Xarita joylashuvi saqlandi',
      });
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

  const getGoogleMapsUrl = () => {
    return `https://www.google.com/maps?q=${latitude},${longitude}`;
  };

  const getEmbedUrl = () => {
    return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2997!2d${longitude}!3d${latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z!5e0!3m2!1suz!2s!4v1`;
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Xarita joylashuvi
        </CardTitle>
        <CardDescription>
          Google Maps xaritasida ko'rsatiladigan manzilni belgilang. Koordinatalarni{' '}
          <a 
            href="https://www.google.com/maps" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Google Maps
          </a>
          {' '}dan olishingiz mumkin.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="latitude">Latitude (Kenglik)</Label>
            <Input
              id="latitude"
              type="text"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              placeholder="41.2911"
            />
            <p className="text-xs text-muted-foreground">
              Masalan: 41.2911
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="longitude">Longitude (Uzunlik)</Label>
            <Input
              id="longitude"
              type="text"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              placeholder="69.2033"
            />
            <p className="text-xs text-muted-foreground">
              Masalan: 69.2033
            </p>
          </div>
        </div>

        {/* Map Preview */}
        <div className="space-y-2">
          <Label>Xarita ko'rinishi</Label>
          <div className="aspect-video rounded-lg overflow-hidden border border-border bg-secondary">
            <iframe
              src={getEmbedUrl()}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Xarita preview"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <a href={getGoogleMapsUrl()} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Google Maps da ochish
            </a>
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
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
      </CardContent>
    </Card>
  );
}
