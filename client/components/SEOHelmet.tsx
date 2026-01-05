import { Helmet } from "react-helmet-async";

interface SEOHelmetProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  author?: string;
  siteName?: string;
  locale?: string;
  twitterCard?: string;
  twitterSite?: string;
  canonical?: string;
  noindex?: boolean;
  nofollow?: boolean;
}

export default function SEOHelmet({
  title = "Intelipadel - Reserva Canchas de Pádel en México",
  description = "Reserva canchas de pádel en los mejores clubes de México. Sistema inteligente de reservas en tiempo real, pagos seguros y confirmación instantánea. ¡Encuentra tu cancha perfecta hoy!",
  keywords = "pádel, padel, canchas de padel, reservar cancha padel, clubes de padel, padel mexico, reservas deportivas, canchas deportivas, torneos padel, clases padel",
  image = "https://garbrix.com/intelipadel/assets/images/logo-intelipadel-header.png",
  url = "https://intelipadel.com",
  type = "website",
  author = "Intelipadel",
  siteName = "Intelipadel",
  locale = "es_MX",
  twitterCard = "summary_large_image",
  twitterSite = "@intelipadel",
  canonical,
  noindex = false,
  nofollow = false,
}: SEOHelmetProps) {
  const fullTitle = title.includes("Intelipadel")
    ? title
    : `${title} | Intelipadel`;
  const currentUrl = canonical || url;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />

      {/* Robots Meta Tags */}
      {(noindex || nofollow) && (
        <meta
          name="robots"
          content={`${noindex ? "noindex" : "index"},${nofollow ? "nofollow" : "follow"}`}
        />
      )}

      {/* Canonical URL */}
      <link rel="canonical" href={currentUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:alt" content={fullTitle} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={locale} />

      {/* Twitter */}
      <meta property="twitter:card" content={twitterCard} />
      <meta property="twitter:url" content={currentUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
      <meta property="twitter:site" content={twitterSite} />
      <meta property="twitter:creator" content={twitterSite} />

      {/* Additional Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="language" content="Spanish" />
      <meta name="geo.region" content="MX" />
      <meta name="geo.placename" content="México" />

      {/* Theme Color */}
      <meta name="theme-color" content="#ea580c" />
      <meta name="msapplication-TileColor" content="#ea580c" />

      {/* Mobile Web App Capable */}
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="Intelipadel" />

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SportsActivityLocation",
          name: siteName,
          description: description,
          url: currentUrl,
          logo: image,
          image: image,
          sameAs: [
            "https://www.facebook.com/intelipadel",
            "https://www.instagram.com/intelipadel",
            "https://twitter.com/intelipadel",
          ],
          address: {
            "@type": "PostalAddress",
            addressCountry: "MX",
            addressLocality: "México",
          },
          sport: "Pádel",
          priceRange: "$$",
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "4.8",
            reviewCount: "1250",
          },
        })}
      </script>
    </Helmet>
  );
}
