export const environment = {
  production: import.meta.env.PROD,
  supabase: {
    url: 'https://qvglqtwjohwjvwyisrbj.supabase.co',
    publishableKey: 'sb_publishable_glKNUZbVYDLsIpbFVvjjMg_A7cylBiT'
  },
  get apiUrl() {
    if (import.meta.env.PROD) {
      return 'https://6a5c88239ea6b6.lhr.life/api';
    }
    return `http://${window.location.hostname}:5132/api`;
  }
};

