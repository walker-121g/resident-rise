import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: serial().primaryKey(),
    email: varchar().unique().notNull(),
    firstName: varchar().notNull(),
    lastName: varchar().notNull(),
    type: varchar({ enum: ["RESIDENT", "STAFF", "ADMIN"] }).default("RESIDENT"),
    createdAt: timestamp({ withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp({ withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp({ withTimezone: true, mode: "date" }),
  },
  (table) => ({
    emailIndex: index("email_index").on(table.email),
  }),
);

export const userCredentials = pgTable("user_credentials", {
  id: serial().primaryKey(),
  userId: integer()
    .notNull()
    .references(() => users.id),
  type: varchar({ enum: ["PASSWORD", "GOOGLE", "MICROSOFT", "APPLE"] }).default(
    "PASSWORD",
  ),
  passwordHash: varchar(),
  lastLoginAt: timestamp({ withTimezone: true, mode: "date" }),
  createdAt: timestamp({ withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp({ withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp({ withTimezone: true, mode: "date" }),
});

export const userSessions = pgTable("user_sessions", {
  id: serial().primaryKey(),
  userId: integer()
    .notNull()
    .references(() => users.id),
  tokenHash: varchar().notNull(),
  ipAddress: varchar(),
  expiresAt: timestamp({ withTimezone: true, mode: "date" }).notNull(),
  createdAt: timestamp({ withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp({ withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp({ withTimezone: true, mode: "date" }),
});

export const communities = pgTable("communities", {
  id: serial().primaryKey(),
  name: varchar().notNull(),
  description: text(),
  address: varchar(),
  contactEmail: varchar(),
  contactPhone: varchar(),
  createdAt: timestamp({ withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp({ withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp({ withTimezone: true, mode: "date" }),
});

export const communityMembers = pgTable("community_members", {
  id: serial().primaryKey(),
  communityId: integer()
    .notNull()
    .references(() => communities.id),
  userId: integer()
    .notNull()
    .references(() => users.id),
  role: varchar({ enum: ["ADMIN", "MEMBER"] }).default("MEMBER"),
  floor: integer(),
  createdAt: timestamp({ withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp({ withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp({ withTimezone: true, mode: "date" }),
});

export const communityPosts = pgTable("community_posts", {
  id: serial().primaryKey(),
  communityId: integer().references(() => communities.id),
  userId: integer().references(() => users.id),
  title: varchar().notNull(),
  body: text().notNull(),
  createdAt: timestamp({ withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp({ withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp({ withTimezone: true, mode: "date" }),
});

export const communityPostComments = pgTable("community_post_comments", {
  id: serial().primaryKey(),
  communityPostId: integer().references(() => communityPosts.id),
  userId: integer().references(() => users.id),
  body: text().notNull(),
  createdAt: timestamp({ withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp({ withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp({ withTimezone: true, mode: "date" }),
});

export const communityPostResults = pgTable("community_post_results", {
  id: serial().primaryKey(),
  communityPostId: integer().references(() => communityPosts.id),
  userId: integer().references(() => users.id),
  type: varchar({ enum: ["LIKE", "DISLIKE"] }).notNull(),
  createdAt: timestamp({ withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp({ withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp({ withTimezone: true, mode: "date" }),
});

export const reports = pgTable("reports", {
  id: serial().primaryKey(),
  userId: integer().references(() => users.id),
  targetId: integer().notNull(),
  targetType: varchar().notNull(),
  reason: text().notNull(),
  createdAt: timestamp({ withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp({ withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp({ withTimezone: true, mode: "date" }),
});
