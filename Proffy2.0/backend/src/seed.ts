import "dotenv/config";
import { prisma } from "./lib/prisma";

// Disciplinas padrão (as mesmas que o formulário de professor tinha fixas antes
// de passar a ler da API). Idempotente: pode rodar várias vezes sem duplicar.
const DEFAULT_SUBJECTS = [
  "Artes",
  "Biologia",
  "Ciências",
  "Educação Física",
  "Física",
  "Geografia",
  "História",
  "Matemática",
  "Português",
  "Química",
];

async function main() {
  for (const name of DEFAULT_SUBJECTS) {
    await prisma.subject.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  const total = await prisma.subject.count();
  console.log(`Seed concluído: ${total} disciplinas no banco.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
