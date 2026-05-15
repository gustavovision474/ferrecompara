import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://qvglqtwjohwjvwyisrbj.supabase.co', 'sb_publishable_glKNUZbVYDLsIpbFVvjjMg_A7cylBiT');

async function test() {
  console.log("Fetching productos...");
  const { data: prods, error: err1 } = await supabase.from('productos').select('*').order('id', { ascending: false }).limit(5);
  console.log("Last 5 products:", prods);
  
  console.log("Fetching inventario...");
  const { data: inv, error: err2 } = await supabase.from('inventario').select('*').order('id', { ascending: false }).limit(5);
  console.log("Last 5 inventory:", inv);
}
test();
