import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create initial settings
  await prisma.setting.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      votingOpen: false,
      electionName: "Pemilihan Ketua Senat Kampus 2026",
    },
  });

  // Create sample candidates - 5 kandidat dari 5 Prodi
  const candidates = [
    {
      number: 1,
      name: "Rizky Pratama Wirajaya",
      prodi: "Teknologi Daya Gerak",
      photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rizky",
      vision: "Mewujudkan senat yang progresif dalam mengembangkan inovasi teknologi daya gera untuk kemandirian pertahanan nasional.",
      mission: "1. Memperkuat riset mahasiswa di bidang teknologi daya gera\n2. Kolaborasi dengan industri pertahanan untuk program magang\n3. Mengembangkan kapasitas SDM melalui workshop dan seminar\n4. Advokasi peningkatan fasilitas laboratorium prodi",
    },
    {
      number: 2,
      name: "Anindya Maharani Putri",
      prodi: "Industri Pertahanan",
      photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Anindya",
      vision: "Senat yang menjembatani mahasiswa industri pertahanan dengan ekosistem industri pertahanan nasional yang berdaya saing global.",
      mission: "1. Membangun jejaring dengan BUMN dan industri pertahanan\n2. Meningkatkan kompetensi mahasiswa melalui sertifikasi profesi\n3. Memperkuat kemitraan strategis dengan kampus lain\n4. Mendorong hilirisasi hasil penelitian mahasiswa",
    },
    {
      number: 3,
      name: "Fajar Nugroho Adiputra",
      prodi: "Teknologi Pengindraan",
      photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Fajar",
      vision: "Mendorong pengembangan teknologi pengindraan modern yang menjadi tulang belakang sistem pertahanan masa depan.",
      mission: "1. Memfasilitasi kompetisi dan inovasi teknologi pengindraan\n2. Penguatan kapasitas laboratorium dan studio prodi\n3. Pertukaran pelajar dan dosen dengan institusi mitra\n4. Mendorong publikasi ilmiah tingkat nasional dan internasional",
    },
    {
      number: 4,
      name: "Kayla Saffanah Hidayat",
      prodi: "Rekayasa Pertahanan Siber",
      photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kayla",
      vision: "Senat yang mencetak talenta pertahanan siber yang siap menghadapi ancaman digital demi kedaulatan negara.",
      mission: "1. Mengembangkan program Capture The Flag (CTF) rutin\n2. Pelatihan ethical hacking dan cyber security\n3. Kerjasama dengan BSSN dan komunitas cyber nasional\n4. Peningkatan infrastruktur keamanan kampus",
    },
    {
      number: 5,
      name: "Daffa Ardiansyah Kurniawan",
      prodi: "Teknologi Persenjataan",
      photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Daffa",
      vision: "Mewujudkan senat yang berkontribusi pada pengembangan teknologi persenjataan modern yang mandiri dan berdaulat.",
      mission: "1. Memperkuat program studi melalui riset terapan\n2. Memfasilitasi kunjungan ke industri pertahanan\n3. Mengembangkan standar keselamatan laboratorium\n4. Mendorong inovasi teknologi persenjataan karya mahasiswa",
    },
  ];

  for (const candidate of candidates) {
    await prisma.candidate.upsert({
      where: { number: candidate.number },
      update: {},
      create: candidate,
    });
  }

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
