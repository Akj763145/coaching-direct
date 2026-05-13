# SEO Implementation Guide (Next.js 15 / React 19)

This guide explains how to implement the SEO configuration panel and dynamic metadata injection in a Next.js environment, as requested.

## 1. The Server Action (`actions/seo.ts`)

```typescript
"use server";

import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function updateSeoSettings(title: string, description: string, keywords: string) {
  const { data, error } = await supabaseAdmin
    .from("platform_settings")
    .upsert({ id: 1, title, description, keywords });

  if (error) throw new Error(error.message);
  return data;
}
```

## 2. Dynamic Metadata Injection (`app/layout.tsx`)

In Next.js, use the `generateMetadata` function to fetch and apply SEO settings globally.

```typescript
import { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function generateMetadata(): Promise<Metadata> {
  const { data: seo } = await supabase
    .from("platform_settings")
    .select("*")
    .eq("id", 1)
    .single();

  return {
    title: seo?.title || "VidyaNation",
    description: seo?.description || "Default Description",
    keywords: seo?.keywords || "education, institutes",
    openGraph: {
      title: seo?.title,
      description: seo?.description,
    }
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

## 3. Implementation in this Project (Vite + Express)

Since this project uses a Vite SPA with an Express backend, we implemented a hybrid approach:
- **Client-side:** `react-helmet-async` updates the document head dynamically as the user navigates.
- **Server-side:** The Express server injects the metadata into the `index.html` file on the fly for initial requests, ensuring search engine crawlers (like Googlebot) see the correct data even without JavaScript.
