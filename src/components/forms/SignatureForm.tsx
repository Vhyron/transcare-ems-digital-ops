'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import SignatureCanvas from 'react-signature-canvas';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Loader, RotateCcw } from 'lucide-react';
import { getPrivateFileUrl } from '../../lib/supabase/storage';

const formSchema = z.object({
  signature: z.instanceof(Blob).refine((blob) => blob && blob.size > 0, {
    message: 'Signature is required',
  }),
});

export type SignatureData = z.infer<typeof formSchema>;

interface Props {
  onSubmit: (data: SignatureData) => void;
  defaultSignature?: string; // Base64 string of the default signature
  loading?: boolean;
}

export default function SignatureForm({
  onSubmit,
  defaultSignature,
  loading = false,
}: Props) {
  const sigCanvasRef = useRef<SignatureCanvas>(null);
  const [isRotating, setIsRotating] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const [existingSignature, setExistingSignature] = useState<string | null>(
    null
  );

  const form = useForm<SignatureData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      signature: undefined,
    },
  });

  useEffect(() => {
    async function init() {
      if (defaultSignature && sigCanvasRef.current) {
        if (existingSignature) {
          sigCanvasRef.current.fromDataURL(existingSignature);
          return;
        }

        const signatureUrl = await getPrivateFileUrl({
          storage: 'signatures',
          path: defaultSignature,
        });

        if (signatureUrl instanceof Error || !signatureUrl) {
          console.error('Failed to get signature URL');
          return;
        }

        const res = await fetch(signatureUrl);
        const blob = await res.blob();
        const reader = new FileReader();

        reader.onloadend = () => {
          const base64 = reader.result as string;
          setExistingSignature(base64);
          sigCanvasRef.current?.fromDataURL(base64);
        };

        reader.readAsDataURL(blob);
      }
    }
    init();
  }, [defaultSignature, refreshKey, existingSignature]);

  const handleSubmit = (data: SignatureData) => {
    onSubmit(data);
  };

  const handleClear = () => {
    sigCanvasRef.current?.clear();
    form.reset();
  };

  const handleEnd = () => {
    if (sigCanvasRef.current && !sigCanvasRef.current?.isEmpty()) {
      sigCanvasRef.current.getCanvas().toBlob((blob) => {
        if (blob) {
          form.setValue('signature', blob);
        }
      }, 'image/png');
    }
  };

  const handleRefresh = () => {
    setIsRotating(true);
    handleClear();

    if (defaultSignature && sigCanvasRef.current) {
      if (existingSignature) {
        sigCanvasRef.current.fromDataURL(existingSignature);
      } else {
        setRefreshKey((k) => k + 1);
      }
    } else {
      setRefreshKey((k) => k + 1);
    }

    setTimeout(() => setIsRotating(false), 1000);
  };

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <div>
          <CardTitle>E-Signature</CardTitle>
          <CardDescription>
            Please draw your signature below for use in electronic forms and
            documentation. <br />
            Note: Refresh to load the default signature if it exists.
          </CardDescription>
        </div>
        <Button variant="outline" onClick={handleRefresh}>
          <RotateCcw
            className={`${isRotating ? 'animate-spin-reverse' : ''}`}
          />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="signature"
              render={() => (
                <FormItem>
                  <FormControl>
                    <div className="border rounded-lg overflow-hidden w-full h-[400px]">
                      <SignatureCanvas
                        ref={sigCanvasRef}
                        penColor="black"
                        onEnd={handleEnd}
                        clearOnResize={true}
                        canvasProps={{
                          style: {
                            width: '100%',
                            height: '100%',
                            backgroundColor: 'whitesmoke',
                          },
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                  <div className="flex justify-end gap-2 mt-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleClear}
                    >
                      Clear
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading && <Loader className="size-4 animate-spin" />}
                      {loading ? 'Saving...' : 'Save Signature'}
                    </Button>
                  </div>
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
