import { getShopPolicy, PolicyHandle } from "@/features/shop/policies";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

interface Props {
  params: Promise<{ handle: string }>;
}

export default async function PolicyDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const handle = resolvedParams.handle as PolicyHandle;
  
  const policy = await getShopPolicy(handle);
  
  if (!policy) {
    notFound();
  }

  return (
    <div className="pt-24 pb-32 px-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-[#2874f0] hover:underline font-semibold cursor-pointer">
          <ChevronLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>

      <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6 border-b border-gray-200 pb-4">
        {policy.title}
      </h1>

      <div 
        className="policy-body text-gray-700 leading-relaxed text-sm md:text-base"
        dangerouslySetInnerHTML={{ __html: policy.body }}
      />

      <style dangerouslySetInnerHTML={{ __html: `
        .policy-body p { margin-bottom: 1.25rem; }
        .policy-body strong { font-weight: 700; color: #111827; }
        .policy-body a { color: #2874f0; text-decoration: underline; }
        .policy-body a:hover { color: #1a5ec7; }
        .policy-body h2, .policy-body h3 { font-size: 1.25rem; font-weight: 700; color: #111827; margin-top: 1.75rem; margin-bottom: 0.75rem; }
        .policy-body ul, .policy-body ol { margin-left: 1.5rem; margin-bottom: 1.25rem; list-style-type: disc; }
        .policy-body li { margin-bottom: 0.5rem; }
      ` }} />
    </div>
  );
}
