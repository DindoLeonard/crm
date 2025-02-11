import { SelectContact, SelectUser } from "@/models";

export type ContactsCol = Partial<SelectContact & { user?: SelectUser | null }>;

export const initialContactsColData: ContactsCol[] = [
  {
    id: "m5gr84i9",
    name: "Ken Johnson",
    leadStatus: "new",
    email: "ken99@yahoo.com",
    phone: "123-456-7890",
    bookTitle: "The Great Gatsby"
  },
  {
    id: "x8fj9h23",
    name: "Emily Thompson",
    leadStatus: "no_answer",
    email: "emily23@hotmail.com",
    phone: "234-567-8901",
    bookTitle: "Moby Dick"
  },
  {
    id: "q3jd92kl",
    name: "Robert Williams",
    leadStatus: "call_back",
    email: "robert.j@gmail.com",
    phone: "345-678-9012",
    bookTitle: "To Kill a Mockingbird"
  },
  {
    id: "v7kl9b82",
    name: "Sophia Brown",
    leadStatus: "not_interested",
    email: "sophia.smith@outlook.com",
    phone: "456-789-0123",
    bookTitle: "1984"
  },
  {
    id: "b9we84f6",
    name: "Liam Martinez",
    leadStatus: "pipe",
    email: "liam.james@yahoo.com",
    phone: "567-890-1234",
    bookTitle: "Brave New World"
  },
  {
    id: "h4uo1p29",
    name: "Olivia Davis",
    leadStatus: "sold_author",
    email: "olivia_williams@gmail.com",
    phone: "678-901-2345",
    bookTitle: "The Catcher in the Rye"
  },
  {
    id: "k7jd83pl",
    name: "James Anderson",
    leadStatus: "new",
    email: "james.brown@icloud.com",
    phone: "789-012-3456",
    bookTitle: "Pride and Prejudice"
  },
  {
    id: "p4lk8q93",
    name: "Mia Rodriguez",
    leadStatus: "hung_up",
    email: "mia.davis@hotmail.com",
    phone: "890-123-4567",
    bookTitle: "The Hobbit"
  },
  {
    id: "t6gf1s28",
    name: "Ethan Lee",
    leadStatus: "refund",
    email: "ethan.collins@aol.com",
    phone: "901-234-5678",
    bookTitle: "War and Peace"
  },
  {
    id: "r3yl9d47",
    name: "Ava Wilson",
    leadStatus: "call_back",
    email: "ava_jones@yahoo.com",
    phone: "012-345-6789",
    bookTitle: "The Odyssey"
  },
  {
    id: "u2op3f83",
    name: "Noah Harris",
    leadStatus: "new",
    email: "noah_jackson@gmail.com",
    phone: "223-456-7890",
    bookTitle: "Don Quixote"
  },
  {
    id: "y5kd2p84",
    name: "Isabella Clark",
    leadStatus: "do_not_call",
    email: "isabella.martin@outlook.com",
    phone: "334-567-8901",
    bookTitle: "Les Misérables"
  },
  {
    id: "d8uq7b31",
    name: "Lucas Garcia",
    leadStatus: "not_in_service",
    email: "lucas_clark@yahoo.com",
    phone: "445-678-9012",
    bookTitle: "The Divine Comedy"
  },
  {
    id: "m2tr9p18",
    name: "Ella Young",
    leadStatus: "wrong_number",
    email: "ella_rogers@hotmail.com",
    phone: "556-789-0123",
    bookTitle: "Hamlet"
  },
  {
    id: "s9ql6b29",
    name: "Mason Walker",
    leadStatus: "pipe",
    email: "mason.turner@gmail.com",
    phone: "667-890-1234",
    bookTitle: "Frankenstein"
  },
  {
    id: "g4vn5p92",
    name: "Charlotte Hall",
    leadStatus: "sold_author",
    email: "charlotte_white@icloud.com",
    phone: "778-901-2345",
    bookTitle: "The Iliad"
  },
  {
    id: "v7jc3l14",
    name: "Alexander King",
    leadStatus: "call_back",
    email: "alexander.jordan@gmail.com",
    phone: "889-012-3456",
    bookTitle: "Crime and Punishment"
  },
  {
    id: "p1lr7t56",
    name: "Amelia Scott",
    leadStatus: "no_answer",
    email: "amelia_brown@aol.com",
    phone: "990-123-4567",
    bookTitle: "The Brothers Karamazov"
  },
  {
    id: "k8wq2p84",
    name: "Benjamin Perez",
    leadStatus: "refund",
    email: "benjamin.evans@outlook.com",
    phone: "101-234-5678",
    bookTitle: "The Grapes of Wrath"
  },
  {
    id: "d3nl6q23",
    name: "Zoe Turner",
    leadStatus: "hung_up",
    email: "zoe.harris@hotmail.com",
    phone: "202-345-6789",
    bookTitle: "One Hundred Years of Solitude"
  }
];
