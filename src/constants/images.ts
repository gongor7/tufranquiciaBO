/**
 * Catálogo de imágenes reales (Unsplash) por slug de franquicia.
 * Permite mostrar fotografías profesionales sin depender de backend:
 * si una imagen falla, las tarjetas muestran el bloque de emoji como respaldo.
 */
const BASE = 'https://images.unsplash.com/photo-';

export const franchiseImages: Record<string, string> = {
  'saltenitas-del-sur': `${BASE}1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80`,
  'cafe-amazonas': `${BASE}1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80`,
  'parrilla-criolla': `${BASE}1544025162-d76694265947?auto=format&fit=crop&w=900&q=80`,
  'jugos-naturales-vida': `${BASE}1553530666-ba11a7da3888?auto=format&fit=crop&w=900&q=80`,
  'pizza-mendoza': `${BASE}1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80`,
  'empanadas-la-abuela': `${BASE}1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=80`,
  'sushi-bol': `${BASE}1579871494447-9811cf80d66c?auto=format&fit=crop&w=900&q=80`,
  'moda-belle-epoque': `${BASE}1441986300917-64674bd600d8?auto=format&fit=crop&w=900&q=80`,
  'tienda-techbo': `${BASE}1468495244123-6c6c332eeece?auto=format&fit=crop&w=900&q=80`,
  'hogar-y-estilo': `${BASE}1586023492125-27b2c045efd7?auto=format&fit=crop&w=900&q=80`,
  'mascota-feliz': `${BASE}1548767797-d8c844163c4c?auto=format&fit=crop&w=900&q=80`,
  'deportes-max': `${BASE}1517649763962-0c623066013b?auto=format&fit=crop&w=900&q=80`,
  'limpieza-express': `${BASE}1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80`,
  'fitzone-gym': `${BASE}1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=80`,
  'autolavado-pro': `${BASE}1607860108855-64acf2078ed9?auto=format&fit=crop&w=900&q=80`,
  'belleza-total': `${BASE}1560066984-138dadb4c035?auto=format&fit=crop&w=900&q=80`,
  'academia-de-idiomas-mundo': `${BASE}1523050854058-8df90110c9f1?auto=format&fit=crop&w=900&q=80`,
  'code-academy-bolivia': `${BASE}1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80`,
  'kids-learning': `${BASE}1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=900&q=80`,
  'marketing-digital-bo': `${BASE}1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80`,
};

/** Imagen por defecto mientras no haya una específica. */
export const defaultFranchiseImage = `${BASE}1497366216548-37526070297c?auto=format&fit=crop&w=900&q=80`;

export function getFranchiseImage(slug: string): string {
  return franchiseImages[slug] ?? defaultFranchiseImage;
}
