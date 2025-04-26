import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "SeraJS",
  description: "1KB Frontend Library",
  markdown: {
    lineNumbers: true,
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Home", link: "/" },
      { text: "About", link: "/about/about" },
    ],
    search: {
      provider: "local",
    },
    logo: "serajs.png",
    sidebar: [
      {
        text: "Introduction",
        items: [
          { text: "Home", link: "/" },
          { text: "Getting Started", link: "/start" },
        ],
      },
      {
        text: "Hooks",
        items: [
          { text: "setSignal", link: "/hooks/setsignal" },
          { text: "setEffect", link: "/hooks/seteffect" },
          { text: "setMemo", link: "/hooks/setmemo" },
        ],
      },
      {
        text: "API",
        items: [
          { text: "Fragment", link: "/hooks/api/fragment" },
          { text: "h", link: "/hooks/api/h" },
        ],
      },
      {
        text: "extra flavour",
        items: [
          { text: "reusable components", link: "/extra/components" },
          { text: "No Build", link: "/extra/nobuild" },
        ],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/sera-js/sera" },
      {
        icon: "linkedin",
        link: "https://www.linkedin.com/in/codernazmulhossain/",
      },
      { icon: "discord", link: "https://discord.gg/whEJ7K8deQ" },
    ],
  },
});
