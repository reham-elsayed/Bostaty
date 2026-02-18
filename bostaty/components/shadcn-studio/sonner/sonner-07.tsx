'use client'

import { toast } from 'sonner'

import { Button } from '@/components/ui/button'

const SonnerWithPromiseDemo = () => {

  return (
    <Button
      variant='outline'
      onClick={() => {
        const promise = new Promise((resolve) => setTimeout(() => resolve({ name: 'Sonner' }), 2000));

        toast.promise(promise, {
          loading: 'Loading...',
          success: (data) => {
            return `${(data as any).name} toast has been added`;
          },
          error: 'Error',
        });
      }}
    >
      Toast with promise
    </Button>
  )
}

export default SonnerWithPromiseDemo
