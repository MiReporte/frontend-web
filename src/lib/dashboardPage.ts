export const dashboard = {
  hero: {
    title: "Bienvenido, ",
    subtitle: "¿Qué te gustaría hacer hoy?",
  },
  cards: [
    {
      icon: "/icons/Resumen.svg",
      title: "Ver resumen",
      desc: "Obtén un resumen de tu actividad reciente.",
      url: "/dashboard/resumen",
      permission: "resumen",
    },
    {
      icon: "/icons/Analisis.svg",
      title: "Ver análisis",
      desc: "Explora los datos y métricas monetarias.",
      url: "/dashboard/analisis",
      permission: "analisis",
    },
    {
      icon: "/icons/Reportes.svg",
      title: "Gestionar reportes",
      desc: "Crea y gestiona los reportes.",
      url: "/dashboard/reportes",
      permission: "reportes",
    },
    {
      icon: "/icons/Usuarios.svg",
      title: "Editar usuarios",
      desc: "Gestiona los usuarios de la aplicación.",
      url: "/dashboard/usuarios",
      permission: "usuarios",
    },
    {
      icon: "/icons/Conceptos.svg",
      title: "Administrar conceptos",
      desc: "Añade, edita o elimina conceptos.",
      url: "/dashboard/catalogo",
      permission: "conceptos",
    },
  ],
};
