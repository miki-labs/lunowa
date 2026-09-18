import {NextIntlClientProvider} from 'next-intl';
import type {ReactNode} from 'react';
import ja from '../messages/ja.json';
import en from '../messages/en.json';

export function AuthTestProvider({children}: {children: ReactNode}) {
  return <NextIntlClientProvider locale="ja" messages={ja}>{children}</NextIntlClientProvider>;
}

export function EnglishAuthTestProvider({children}: {children: ReactNode}) {
  return <NextIntlClientProvider locale="en" messages={en}>{children}</NextIntlClientProvider>;
}
