import test from "node:test";
import assert from "node:assert/strict";
import {
  buildRequestedGroups,
  deriveGroupName,
  resolveResultGroupKey,
} from "../lib/keyword-groups.js";

const BRANDS = [
  "7 Day Addiction",
  "Ascent Nutrition",
  "Bernie's Best",
  "Best Buy Boxes",
  "Big South Strength and Nutrition",
  "CRISAN Beauty",
  "Discount Shop Towels",
  "Emalux Beauty",
  "Fire Sale Boxes",
  "Gia Roma",
  "Glamour Boutique",
  "Glow Off Co.",
  "Grim Shadows Studios",
  "Grower Gear",
  "Happy Candy Kingdom",
  "Happy Hour Beauty",
  "Hydratherma Naturals",
  "INVIROX DOG TRAINING GEAR",
  "Kalaya Health",
  "Linsoul Audio",
  "Madam Glow",
  "Mahjong Studios",
  "MOLIAE Beauty",
  "Morning Glamour",
  "Mysteek Naturals",
  "NICEHCK Audio",
  "NION Health",
  "NSPA Shop",
  "Pet Juice",
  "PET MARVEL",
  "Planet Green Recycle",
  "Pretty Theory Beauty",
  "Pure Elegance Fashion Plus",
  "Pure Numb Tattoo Numbing",
  "Royal Clips",
  "Royal Luxs LLC",
  "SAM + LEO",
  "Shop NextBuy",
  "Siberian Green",
  "Simply Brown Coffee",
  "Skinny Coffee SuperBoost",
  "Steal The Deal",
  "Stevie G Jerky",
  "Tangles B. Gone",
  "The Beauty Corner",
  "The DNA Company",
  "The Grip Comb",
  "The Right Filter",
  "White Rose Books & More",
];

const MODIFIERS = [
  "coupon",
  "coupon code",
  "discount",
  "discount code",
  "discounts",
  "Promo",
  "Promo code",
  "voucher",
  "voucher code",
];

const keywords = BRANDS.flatMap((brand) => MODIFIERS.map((modifier) => `${brand} ${modifier}`));

test("creates one group per brand for the client keyword list", () => {
  assert.equal(keywords.length, 441);

  const { groups } = buildRequestedGroups(keywords);

  assert.equal(groups.length, 49);
  assert.deepEqual(
    groups.map((group) => group.name).sort(),
    [...BRANDS].sort()
  );
  assert.ok(groups.every((group) => group.requestedKeywords.length === MODIFIERS.length));
});

test("only strips modifiers from the end of a keyword", () => {
  assert.equal(deriveGroupName("Discount Shop Towels discount code"), "Discount Shop Towels");
  assert.equal(deriveGroupName("Fire Sale Boxes coupon"), "Fire Sale Boxes");
  assert.equal(deriveGroupName("Best Buy Boxes voucher code"), "Best Buy Boxes");
  assert.equal(deriveGroupName("Gia Roma Promo code"), "Gia Roma");
  assert.equal(deriveGroupName("Grower Gear coupon code"), "Grower Gear");
});

test("preserves short tokens, acronyms, and punctuation", () => {
  assert.equal(deriveGroupName("7 Day Addiction coupon code"), "7 Day Addiction");
  assert.equal(deriveGroupName("Stevie G Jerky discount"), "Stevie G Jerky");
  assert.equal(deriveGroupName("Tangles B. Gone voucher"), "Tangles B. Gone");
  assert.equal(deriveGroupName("SAM + LEO coupon"), "SAM + LEO");
  assert.equal(deriveGroupName("Glow Off Co. coupon"), "Glow Off Co.");
  assert.equal(deriveGroupName("White Rose Books & More discount code"), "White Rose Books & More");
});

test("does not merge brands that share generic words", () => {
  const { groups } = buildRequestedGroups(keywords);
  const names = groups.map((group) => group.name);

  for (const generic of ["Beauty", "The", "Shop", "Health", "Audio", "Pet", "Royal"]) {
    assert.ok(!names.includes(generic), `unexpected generic group: ${generic}`);
  }

  for (const brand of [
    "CRISAN Beauty",
    "Emalux Beauty",
    "Happy Hour Beauty",
    "MOLIAE Beauty",
    "Pretty Theory Beauty",
    "The Beauty Corner",
  ]) {
    assert.ok(names.includes(brand), `missing brand: ${brand}`);
  }

  assert.ok(names.includes("The DNA Company"));
  assert.ok(names.includes("The Grip Comb"));
  assert.ok(names.includes("The Right Filter"));
  assert.ok(names.includes("Steal The Deal"));
});

test("strips multilingual trailing modifiers", () => {
  assert.equal(deriveGroupName("Nike rabattkode"), "Nike");
  assert.equal(deriveGroupName("Nike gutschein code"), "Nike");
  assert.equal(deriveGroupName("Nike code promo"), "Nike");
});

test("resolves Google result rows through exact matches and close variants", () => {
  const { keywordToGroupKey } = buildRequestedGroups(["Acme coupon", "Acme promo"]);

  assert.equal(resolveResultGroupKey({ keyword: "Acme coupon" }, keywordToGroupKey), "acme");
  assert.equal(
    resolveResultGroupKey({ keyword: "Acme deals", closeVariants: ["Acme coupon"] }, keywordToGroupKey),
    "acme"
  );
  assert.equal(resolveResultGroupKey({ keyword: "Other Brand coupon" }, keywordToGroupKey), "other brand");
});
