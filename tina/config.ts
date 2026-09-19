import { defineConfig } from "tinacms";

const branch =
  process.env.NEXT_PUBLIC_TINA_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  "main";

const text = (name: string, label: string, description?: string) => ({
  type: "string" as const,
  name,
  label,
  ...(description ? { description } : {}),
});

const richText = (name: string, label: string, description?: string) => ({
  type: "rich-text" as const,
  name,
  label,
  ...(description ? { description } : {}),
});

const image = (name: string, label: string, description?: string) => ({
  type: "image" as const,
  name,
  label,
  ...(description ? { description } : {}),
});

const money = (name: string, label: string) => ({
  type: "number" as const,
  name,
  label,
  description: "Precio en MXN.",
  ui: {
    validate: (value: number | undefined) =>
      value != null && value < 0 ? "El precio no puede ser negativo." : null,
  },
});

export default defineConfig({
  branch,

  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID || null,
  token: process.env.TINA_TOKEN || null,

  build: {
    outputFolder: "tina-admin",
    publicFolder: "public",
  },

  media: {
    tina: {
      publicFolder: "public",
      mediaRoot: "images",
    },
  },

  schema: {
    collections: [
      {
        name: "siteSettings",
        label: "Configuración general",
        path: "content/site",
        format: "json",
        ui: {
          global: true,
        },
        fields: [
          text("siteName", "Nombre del sitio"),
          text("whatsapp", "WhatsApp", "Número que utiliza NEXTLI para contacto y envío del resumen del configurador."),
          text("whatsappMessage", "Mensaje predeterminado de WhatsApp"),
          text("phone", "Teléfono"),
          text("email", "Correo electrónico"),
          text("address", "Dirección"),
          text("mapEmbedUrl", "URL del mapa"),
          text("instagramUrl", "Instagram"),
          text("facebookUrl", "Facebook"),
          image("logo", "Logo NEXTLI"),
          text("primaryCtaLabel", "Texto del botón principal"),
          text("guideCtaLabel", "Texto del botón Guía de despedida"),
          text("configuratorCtaLabel", "Texto del botón Personaliza tu despedida"),
        ],
      },

      {
        name: "hero",
        label: "Inicio / Hero",
        path: "content/hero",
        format: "json",
        ui: {
          global: true,
        },
        fields: [
          text("eyebrow", "Texto superior"),
          text("title", "Título principal"),
          text("highlight", "Palabra o frase destacada"),
          richText("description", "Descripción"),
          image("logo", "Logo del Hero"),
          image("showcaseImage", "Imagen destacada"),
          text("showcaseCaption", "Texto bajo la imagen"),
          text("primaryButtonLabel", "Botón principal"),
          text("primaryButtonAction", "Acción del botón principal"),
          text("secondaryButtonLabel", "Botón secundario"),
          text("secondaryButtonAction", "Acción del botón secundario"),
        ],
      },

      {
        name: "about",
        label: "Nosotros",
        path: "content/about",
        format: "json",
        ui: {
          global: true,
        },
        fields: [
          text("eyebrow", "Texto superior"),
          text("title", "Título"),
          richText("description", "Descripción"),
          {
            type: "object",
            name: "pillars",
            label: "Pilares de NEXTLI",
            list: true,
            fields: [
              text("icon", "Icono"),
              text("title", "Título"),
              text("description", "Descripción"),
            ],
          },
        ],
      },

      {
        name: "service",
        label: "Servicios",
        path: "content/services",
        format: "json",
        fields: [
          text("name", "Nombre", "Nombre visible del servicio."),
          text("slug", "Identificador"),
          text("tag", "Etiqueta"),
          richText("description", "Descripción"),
          {
            type: "string",
            name: "features",
            label: "Incluye",
            list: true,
          },
          money("price", "Precio"),
          text("priceLabel", "Texto del precio"),
          text("empathyNote", "Nota de acompañamiento"),
          text("buttonLabel", "Texto del botón"),
          text("buttonAction", "Acción del botón"),
          {
            type: "boolean",
            name: "active",
            label: "Activo",
          },
          {
            type: "number",
            name: "order",
            label: "Orden",
          },
        ],
      },

      {
        name: "urn",
        label: "Urnas",
        path: "content/urnas",
        format: "json",
        fields: [
          text("name", "Nombre", "Nombre comercial de la urna."),
          text("slug", "Identificador"),
          image("image", "Imagen de la urna"),
          text("description", "Descripción"),
          text("note", "Nota adicional"),
          money("price", "Precio base"),
          money("priceIndividual", "Precio con cremación individual"),
          money("priceWithoutRecovery", "Precio con cremación sin recuperación"),
          {
            type: "object",
            name: "prices",
            label: "Precios adicionales",
            list: true,
            fields: [
              text("label", "Concepto"),
              money("amount", "Precio"),
            ],
          },
          {
            type: "boolean",
            name: "active",
            label: "Disponible",
          },
          {
            type: "number",
            name: "order",
            label: "Orden",
          },
        ],
      },

      {
        name: "extra",
        label: "Extras y personalización",
        path: "content/extras",
        format: "json",
        fields: [
          text("name", "Nombre"),
          text("slug", "Identificador"),
          image("image", "Imagen"),
          text("alt", "Texto alternativo de la imagen"),
          richText("description", "Descripción"),
          money("price", "Precio"),
          text("priceLabel", "Texto del precio"),
          text("buttonLabel", "Texto del botón"),
          text("buttonAction", "Acción del botón"),
          {
            type: "boolean",
            name: "active",
            label: "Activo",
          },
          {
            type: "number",
            name: "order",
            label: "Orden",
          },
        ],
      },

      {
        name: "frameVinyl",
        label: "Marcos y vinilos",
        path: "content/marcos-vinilos",
        format: "json",
        fields: [
          text("name", "Nombre"),
          text("type", "Tipo", "Ejemplo: marco, vinilo, cuadro, huella."),
          image("image", "Imagen"),
          text("description", "Descripción"),
          money("price", "Precio"),
          text("priceLabel", "Texto del precio"),
          {
            type: "boolean",
            name: "active",
            label: "Activo",
          },
          {
            type: "number",
            name: "order",
            label: "Orden",
          },
        ],
      },

      {
        name: "configurator",
        label: "Configurador / Personaliza tu despedida",
        path: "content/configurator",
        format: "json",
        ui: {
          global: true,
        },
        fields: [
          text("eyebrow", "Texto superior"),
          text("title", "Título"),
          richText("description", "Descripción"),
          text("step1Title", "Paso 1: tipo de servicio"),
          text("step2Title", "Paso 2: datos"),
          text("step3Title", "Paso 3: urna"),
          text("step4Title", "Paso 4: personalización"),
          text("step5Title", "Paso 5: resumen"),
          {
            type: "object",
            name: "animalOptions",
            label: "Tipos de mascota",
            list: true,
            fields: [
              text("value", "Valor"),
              text("label", "Nombre"),
              text("icon", "Icono"),
            ],
          },
          {
            type: "object",
            name: "colorOptions",
            label: "Opciones de color",
            list: true,
            fields: [
              text("value", "Valor"),
              text("label", "Nombre"),
              text("hex", "Color hexadecimal"),
            ],
          },
          text("evidencePhotoLabel", "Texto para foto de evidencia"),
          text("farewellMessageLabel", "Texto para mensaje de despedida"),
          text("summaryTitle", "Título del resumen"),
          text("totalLabel", "Etiqueta del total"),
          text("whatsappButtonLabel", "Botón de WhatsApp"),
          text("backButtonLabel", "Botón Atrás"),
          text("continueButtonLabel", "Botón Continuar"),
        ],
      },

      {
        name: "faq",
        label: "Preguntas frecuentes",
        path: "content/faq",
        format: "json",
        fields: [
          text("question", "Pregunta"),
          richText("answer", "Respuesta"),
          {
            type: "boolean",
            name: "active",
            label: "Activo",
          },
          {
            type: "number",
            name: "order",
            label: "Orden",
          },
        ],
      },

      {
        name: "farewellGuide",
        label: "Guía de despedida",
        path: "content/farewell-guide",
        format: "json",
        ui: {
          global: true,
        },
        fields: [
          text("eyebrow", "Texto superior"),
          text("title", "Título"),
          richText("intro", "Introducción"),
          {
            type: "object",
            name: "steps",
            label: "Pasos de la guía",
            list: true,
            fields: [
              text("title", "Título"),
              richText("description", "Descripción"),
            ],
          },
          richText("closing", "Cierre"),
        ],
      },

      {
        name: "footer",
        label: "Pie de página",
        path: "content/footer",
        format: "json",
        ui: {
          global: true,
        },
        fields: [
          text("title", "Título"),
          richText("description", "Descripción"),
          text("contactTitle", "Título de contacto"),
          text("locationTitle", "Título de ubicación"),
          text("closingMessage", "Mensaje de cierre"),
          text("legalText", "Texto legal"),
          text("privacyLabel", "Texto de privacidad"),
          text("termsLabel", "Texto de términos"),
        ],
      },
    ],
  },

  telemetry: "disabled",
});
