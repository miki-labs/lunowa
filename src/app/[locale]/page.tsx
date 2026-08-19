import {getTranslations} from 'next-intl/server';
import {BootstrapProof} from '@/components/bootstrap-proof';

export default async function BootstrapPage() {
  const t = await getTranslations('Bootstrap');

  return (
    <BootstrapProof
      eyebrow={t('eyebrow')}
      title={t('title')}
      description={t('description')}
      status={t('status')}
    />
  );
}
