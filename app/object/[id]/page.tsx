import Link from "next/link";
import { notFound } from "next/navigation";
import { MuseumObjectDetail } from "@/components/MuseumObjectDetail";
import { getMuseumObjectByDetailId } from "@/lib/iiif";

export const dynamic = "force-dynamic";

interface ObjectPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ObjectPage({ params }: ObjectPageProps) {
  const { id } = await params;
  const object = await getMuseumObjectByDetailId(id);

  if (!object) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <Link href="/" className="inline-flex text-sm font-medium text-stone-600 transition hover:text-stone-950">
        ← Back to collection
      </Link>
      <MuseumObjectDetail object={object} />
    </div>
  );
}
