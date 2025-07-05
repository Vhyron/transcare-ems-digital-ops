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
import { RotateCcw } from 'lucide-react';

const formSchema = z.object({
  signature: z.string().min(1, 'Signature is required'),
});

export type SignatureData = z.infer<typeof formSchema>;

interface Props {
  onSubmit: (data: SignatureData) => void;
  defaultSignature?: string; // Base64 string of the default signature
}

export default function SignatureForm({ onSubmit, defaultSignature }: Props) {
  const sigCanvasRef = useRef<SignatureCanvas>(null);
  const [isRotating, setIsRotating] = useState(false);

  const form = useForm<SignatureData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      signature: defaultSignature || '',
    },
  });

  useEffect(() => {
    if (defaultSignature && sigCanvasRef.current) {
      sigCanvasRef.current.fromDataURL(defaultSignature);
    }
  }, [defaultSignature]);

  const handleClear = () => {
    sigCanvasRef.current?.clear();
    form.setValue('signature', '');
  };

  const handleEnd = () => {
    if (!sigCanvasRef.current?.isEmpty()) {
      const base64 = sigCanvasRef
        .current!.getTrimmedCanvas()
        .toDataURL('image/png');
      form.setValue('signature', base64);
    }
  };

  const handleRefresh = () => {
    setIsRotating(true);
    sigCanvasRef.current?.fromDataURL(defaultSignature || '');
    form.setValue('signature', defaultSignature || '');

    setTimeout(() => setIsRotating(false), 1000);
  };

  const handleSubmit = (data: SignatureData) => {
    onSubmit(data);
  };

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <div>
          <CardTitle>E-Signature</CardTitle>
          <CardDescription>
            Please draw your signature below for use in electronic forms and
            documentation.
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
                    <div className="border rounded-lg overflow-hidden w-full">
                      <SignatureCanvas
                        ref={sigCanvasRef}
                        penColor="black"
                        onEnd={handleEnd}
                        canvasProps={{
                          width: 1220,
                          height: 400,
                          style: {
                            backgroundColor: 'whitesmoke',
                          },
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                  <div className="mt-2 flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleClear}
                    >
                      Clear
                    </Button>
                    <Button type="submit">Save Signature</Button>
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
