import { LegalPage, legalMetadata } from "@/components/LegalPage";

type Props = { params: Promise<{ locale: string }> };

export function generateMetadata({ params }: Props) {
  return legalMetadata("editorial", params);
}

export default function EditorialPolicyPage({ params }: Props) {
  return <LegalPage pageKey="editorial" params={params} />;
}
