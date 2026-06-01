export const environment = {
  production: import.meta.env.PROD,
  supabase: {
    url: 'https://qvglqtwjohwjvwyisrbj.supabase.co',
    publishableKey: 'sb_publishable_glKNUZbVYDLsIpbFVvjjMg_A7cylBiT'
  },
  get apiUrl() {
    if (import.meta.env.PROD) {
      return 'https://e2f40fc240e9a459-181-199-46-139.serveousercontent.com/api';
    }
    return `http://${window.location.hostname}:5132/api`;
  }
};

