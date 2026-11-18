"use client";

import { useTransition } from "react";

/**
 * onSubmit handler that dispatches a useActionState action WITHOUT React 19's automatic
 * form reset — so a validation error never wipes what the user typed.
 */
export function useSubmitWithoutReset(dispatch: (fd: FormData) => void) {
  const [, startTransition] = useTransition();
  return (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLElement | null;
    const fd = new FormData(e.currentTarget, submitter);
    startTransition(() => dispatch(fd));
  };
}
