import { NextResponse } from 'next/server'
import { db, err, authUser, isAdmin } from '@/lib/server'
export async function POST(req: Request) {
  const u = await authUser(req); if (!u || !(await isAdmin(u.id))) return err('Akses ditolak', 403)
  const fd = await req.formData(), file = fd.get('file') as File | null, folder = fd.get('folder') === 'poster' ? 'poster' : 'product'
  if (!file || !file.type.startsWith('image/')) return err('File harus berupa gambar')
  if (file.size > 3_000_000) return err('Ukuran foto maksimal 3 MB')
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`
  const { error } = await db.storage.from('images').upload(path, Buffer.from(await file.arrayBuffer()), { contentType: 'image/jpeg' })
  if (error) return err('Upload gagal: ' + error.message, 500)
  return NextResponse.json({ url: db.storage.from('images').getPublicUrl(path).data.publicUrl })
}
