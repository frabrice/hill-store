import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Clock } from 'lucide-react';
import { RingDivider } from '@/components/brand/ComfortRing';
import { PlushButton } from '@/components/ui/PlushButton';
import { useArticle, useArticles } from '@/hooks/useCatalog';
import { useUI } from '@/store/ui';
import { formatDate } from '@/lib/format';
import { ACCENTS } from '@/lib/theme';

function ArticleCard({ article, index }: { article: NonNullable<ReturnType<typeof useArticles>['data']>[number]; index: number }) {
  const accent = ACCENTS[article.colorKey];
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.06, 0.4), ease: [0.22, 1, 0.36, 1] }}
      style={{
        ['--accent' as string]: accent.surface,
        ['--accent-ink' as string]: accent.ink,
      }}
    >
      <Link
        to={`/learn/${article.slug}`}
        className="group flex h-full flex-col overflow-hidden rounded-3xl bg-surface shadow-plush transition-all duration-300 ease-plush hover:-translate-y-1.5 hover:shadow-plush-lg"
      >
        <div className="relative h-32 overflow-hidden bg-[hsl(var(--accent)/0.3)]">
          <div className="absolute -right-6 -top-8 h-32 w-32 rounded-full bg-surface/40" />
          <div className="absolute -bottom-10 left-6 h-24 w-24 rounded-full bg-surface/30" />
          <BookOpen
            className="absolute right-5 top-1/2 h-16 w-16 -translate-y-1/2 text-[hsl(var(--accent-ink))] opacity-40"
            strokeWidth={1.2}
            aria-hidden
          />
        </div>
        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-center gap-2 text-xs text-ink-faint">
            <span className="rounded-full bg-[hsl(var(--accent)/0.25)] px-2.5 py-0.5 font-semibold text-[hsl(var(--accent-ink))]">
              {article.topic}
            </span>
            <span>{article.readMinutes} min read</span>
          </div>
          <h3 className="mt-2.5 font-display text-lg font-bold leading-snug">{article.title}</h3>
          <p className="mt-1.5 flex-1 text-sm leading-relaxed text-ink-soft">{article.excerpt}</p>
          <span className="mt-3 text-xs text-ink-faint">{formatDate(article.publishedAt)}</span>
        </div>
      </Link>
    </motion.div>
  );
}

function LearnList() {
  const { data: articles } = useArticles();
  const setAccent = useUI((s) => s.setAccent);

  useEffect(() => {
    setAccent('lavender');
  }, [setAccent]);

  return (
    <>
      <section className="relative overflow-hidden border-b border-hairline bg-[hsl(var(--accent)/0.14)]">
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <p className="text-eyebrow font-bold uppercase text-[hsl(var(--accent-ink))]">Learn</p>
          <h1 className="mt-1 font-display text-display-lg font-bold">Guidance for the early days</h1>
          <RingDivider className="mt-3" />
          <p className="mt-3 max-w-xl text-ink-soft">
            Short, practical guides on feeding, sleep, skincare and the questions every new
            parent has at 2am.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {articles?.map((article, i) => (
            <ArticleCard key={article.slug} article={article} index={i} />
          ))}
        </div>
      </div>
    </>
  );
}

function LearnArticle({ slug }: { slug: string }) {
  const { data: article, isPending } = useArticle(slug);
  const { data: articles } = useArticles();
  const setAccent = useUI((s) => s.setAccent);

  useEffect(() => {
    if (article) setAccent(article.colorKey);
  }, [article, setAccent]);

  if (isPending) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <div className="skeleton h-8 w-2/3 rounded-full" />
        <div className="skeleton mt-4 h-40 w-full rounded-2xl" />
      </div>
    );
  }

  if (!article) {
    return (
      <section className="relative overflow-hidden">
        <div className="relative mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 py-20 text-center">
          <h1 className="font-display text-display-lg font-bold">We couldn&rsquo;t find that guide</h1>
          <RingDivider className="mt-4" />
          <PlushButton to="/learn" className="mt-8">
            Back to Learn
          </PlushButton>
        </div>
      </section>
    );
  }

  const more = articles?.filter((a) => a.slug !== article.slug).slice(0, 3) ?? [];

  return (
    <section className="relative overflow-hidden">
      <div className="relative mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <nav aria-label="Breadcrumb" className="text-sm text-ink-soft">
          <Link to="/learn" className="hover:text-[hsl(var(--accent-ink))]">
            Learn
          </Link>
          <span className="mx-2 text-ink-faint">/</span>
          <span className="text-ink">{article.title}</span>
        </nav>

        <span className="mt-5 inline-block rounded-full bg-[hsl(var(--accent)/0.22)] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[hsl(var(--accent-ink))]">
          {article.topic}
        </span>
        <h1 className="mt-3 font-display text-display-lg font-bold leading-tight">
          {article.title}
        </h1>
        <div className="mt-3 flex items-center gap-3 text-sm text-ink-faint">
          <span>{article.author}</span>
          <span>·</span>
          <span>{formatDate(article.publishedAt)}</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" aria-hidden />
            {article.readMinutes} min read
          </span>
        </div>
        <RingDivider className="mt-5" />

        <div className="mt-6 space-y-4 leading-relaxed text-ink-soft">
          {article.body.split('\n\n').map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>

        {more.length > 0 && (
          <div className="mt-14">
            <h2 className="font-display text-xl font-bold">More guides</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {more.map((a, i) => (
                <ArticleCard key={a.slug} article={a} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export function Learn() {
  const { slug } = useParams();
  return slug ? <LearnArticle slug={slug} /> : <LearnList />;
}
