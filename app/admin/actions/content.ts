"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { cloudinaryDeleteAsset } from "@/lib/cloudinary";
import { checkbox, commaSeparated, dateValue, imageType, numberValue, optional, priceLabel, publishStatus, required, parseAdminForm, parseAdminId, handleAdminError, revalidatePublicContent } from "./utils";

const productImageSchema = z.object({
  id: optional,
  productId: required,
  url: required,
  titleAr: optional,
  titleEn: optional,
  titleHe: optional,
  captionAr: optional,
  captionEn: optional,
  captionHe: optional,
  altAr: optional,
  altEn: optional,
  altHe: optional,
  imageType,
  publicId: optional
});

const categorySchema = z.object({
  id: optional,
  slug: required,
  nameAr: required,
  nameEn: required,
  nameHe: required,
  descriptionAr: optional,
  descriptionEn: optional,
  descriptionHe: optional,
  imageUrl: optional,
  status: publishStatus
});

const fabricSchema = z.object({
  id: optional,
  code: required,
  slug: required,
  nameAr: required,
  nameEn: required,
  nameHe: required,
  familyAr: optional,
  familyEn: optional,
  familyHe: optional,
  colorNameAr: optional,
  colorNameEn: optional,
  colorNameHe: optional,
  hexColor: optional,
  typeAr: optional,
  typeEn: optional,
  typeHe: optional,
  availabilityAr: optional,
  availabilityEn: optional,
  availabilityHe: optional,
  descriptionAr: optional,
  descriptionEn: optional,
  descriptionHe: optional,
  imageUrl: optional,
  status: publishStatus
});

const offerSchema = z.object({
  id: optional,
  slug: required,
  titleAr: required,
  titleEn: required,
  titleHe: required,
  descriptionAr: optional,
  descriptionEn: optional,
  descriptionHe: optional,
  imageUrl: optional,
  priceLabel,
  campaignSlug: optional,
  whatsappTemplateAr: optional,
  whatsappTemplateEn: optional,
  whatsappTemplateHe: optional,
  status: publishStatus
});

const galleryAlbumSchema = z.object({
  id: optional,
  slug: required,
  titleAr: required,
  titleEn: required,
  titleHe: required,
  descriptionAr: optional,
  descriptionEn: optional,
  descriptionHe: optional,
  coverImageUrl: optional,
  status: publishStatus
});

const galleryItemSchema = z.object({
  id: optional,
  albumId: optional,
  titleAr: optional,
  titleEn: optional,
  titleHe: optional,
  captionAr: optional,
  captionEn: optional,
  captionHe: optional,
  imageUrl: required,
  altAr: optional,
  altEn: optional,
  altHe: optional,
  imageType,
  publicId: optional,
  status: publishStatus
});

const productSchema = z.object({
  id: optional,
  code: required,
  slug: required,
  categoryId: required,
  titleAr: required,
  titleEn: required,
  titleHe: required,
  summaryAr: optional,
  summaryEn: optional,
  summaryHe: optional,
  descriptionAr: optional,
  descriptionEn: optional,
  descriptionHe: optional,
  customizationAr: optional,
  customizationEn: optional,
  customizationHe: optional,
  availabilityAr: optional,
  availabilityEn: optional,
  availabilityHe: optional,
  priceLabel,
  status: publishStatus,
  coverImageUrl: optional,
  seoTitleAr: optional,
  seoTitleEn: optional,
  seoTitleHe: optional,
  seoDescriptionAr: optional,
  seoDescriptionEn: optional,
  seoDescriptionHe: optional
});

export async function saveProduct(formData: FormData) {
  const data = await parseAdminForm(productSchema, formData, "/admin/products");
  const fabricSlugs = (commaSeparated(formData, "fabrics") ?? []) as string[];
  const productSlugs = (commaSeparated(formData, "relatedProducts") ?? []) as string[];
  const payload = {
    ...data,
    id: undefined,
    isCustomMade: checkbox(formData, "isCustomMade"),
    isFeatured: checkbox(formData, "isFeatured"),
    isNew: checkbox(formData, "isNew"),
    sortOrder: numberValue(formData, "sortOrder")
  };
  try {
    if (data.id) {
      const productId: string = data.id;
      await prisma.$transaction(async (tx) => {
        await tx.product.update({ where: { id: productId }, data: payload });
        await tx.productFabric.deleteMany({ where: { productId } });
        if (fabricSlugs.length > 0) {
          const fabrics = await tx.fabric.findMany({ where: { slug: { in: fabricSlugs } }, select: { id: true } });
          await tx.productFabric.createMany({ data: fabrics.map((f) => ({ productId, fabricId: f.id })), skipDuplicates: true });
        }
        await tx.productRelation.deleteMany({ where: { productId } });
        if (productSlugs.length > 0) {
          const related = await tx.product.findMany({ where: { slug: { in: productSlugs } }, select: { id: true } });
          await tx.productRelation.createMany({ data: related.map((r) => ({ productId, relatedProductId: r.id })), skipDuplicates: true });
        }
      });
    } else {
      await prisma.$transaction(async (tx) => {
        const product = await tx.product.create({ data: payload });
        if (fabricSlugs.length > 0) {
          const fabrics = await tx.fabric.findMany({ where: { slug: { in: fabricSlugs } }, select: { id: true } });
          await tx.productFabric.createMany({ data: fabrics.map((f) => ({ productId: product.id, fabricId: f.id })), skipDuplicates: true });
        }
        if (productSlugs.length > 0) {
          const related = await tx.product.findMany({ where: { slug: { in: productSlugs } }, select: { id: true } });
          await tx.productRelation.createMany({ data: related.map((r) => ({ productId: product.id, relatedProductId: r.id })), skipDuplicates: true });
        }
      });
    }
  } catch (e) { handleAdminError(e, "saveProduct", "/admin/products"); }
  revalidatePublicContent("public-products");
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function deleteProduct(formData: FormData) {
  const id = parseAdminId(formData, "/admin/products");
  try {
    await prisma.product.update({ where: { id }, data: { deletedAt: new Date(), status: "draft" } });
  } catch (e) { handleAdminError(e, "deleteProduct", "/admin/products"); }
  revalidatePublicContent("public-products");
  revalidatePath("/admin/products");
}

export async function restoreProduct(formData: FormData) {
  const id = parseAdminId(formData, "/admin/products");
  try {
    await prisma.product.update({ where: { id }, data: { deletedAt: null } });
  } catch (e) { handleAdminError(e, "restoreProduct", "/admin/products"); }
  revalidatePublicContent("public-products");
  revalidatePath("/admin/products");
}

export async function saveProductImage(formData: FormData) {
  const data = await parseAdminForm(productImageSchema, formData, "/admin/products");
  const isCover = checkbox(formData, "isCover");
  const payload = { ...data, id: undefined, isCover, sortOrder: numberValue(formData, "sortOrder") };
  try {
    await prisma.$transaction(async (tx) => {
      if (isCover) await tx.productImage.updateMany({ where: { productId: data.productId }, data: { isCover: false } });
      if (data.id) await tx.productImage.update({ where: { id: data.id }, data: payload });
      else await tx.productImage.create({ data: payload });
      if (isCover) await tx.product.update({ where: { id: data.productId }, data: { coverImageUrl: data.url } });
    });
  } catch (e) { handleAdminError(e, "saveProductImage", "/admin/products"); }
  revalidatePublicContent("public-products");
  revalidatePath("/admin/products");
}

export async function deleteProductImage(formData: FormData) {
  const id = parseAdminId(formData, "/admin/products");
  try {
    const image = await prisma.productImage.findUnique({ where: { id }, select: { publicId: true } });
    if (image?.publicId) await cloudinaryDeleteAsset(image.publicId);
    await prisma.productImage.delete({ where: { id } });
  } catch (e) { handleAdminError(e, "deleteProductImage", "/admin/products"); }
  revalidatePublicContent("public-products");
  revalidatePath("/admin/products");
}

export async function saveCategory(formData: FormData) {
  const data = await parseAdminForm(categorySchema, formData, "/admin/categories");
  const payload = { ...data, id: undefined, sortOrder: numberValue(formData, "sortOrder") };
  try {
    if (data.id) await prisma.category.update({ where: { id: data.id }, data: payload });
    else await prisma.category.create({ data: payload });
  } catch (e) { handleAdminError(e, "saveCategory", "/admin/categories"); }
  revalidatePublicContent("public-categories", "public-products");
  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function deleteCategory(formData: FormData) {
  const id = parseAdminId(formData, "/admin/categories");
  try {
    await prisma.category.delete({ where: { id } });
  } catch (e) { handleAdminError(e, "deleteCategory", "/admin/categories"); }
  revalidatePublicContent("public-categories", "public-products");
  revalidatePath("/admin/categories");
}

export async function saveFabric(formData: FormData) {
  const data = await parseAdminForm(fabricSchema, formData, "/admin/fabrics");
  const productSlugs = (commaSeparated(formData, "products") ?? []) as string[];
  const payload = { ...data, id: undefined };
  try {
    if (data.id) {
      const fabricId: string = data.id;
      await prisma.$transaction(async (tx) => {
        await tx.fabric.update({ where: { id: fabricId }, data: payload });
        await tx.productFabric.deleteMany({ where: { fabricId } });
        if (productSlugs.length > 0) {
          const products = await tx.product.findMany({ where: { slug: { in: productSlugs } }, select: { id: true } });
          await tx.productFabric.createMany({ data: products.map((p) => ({ productId: p.id, fabricId })), skipDuplicates: true });
        }
      });
    } else {
      const fabric = await prisma.fabric.create({ data: payload });
      if (productSlugs.length > 0) {
        const products = await prisma.product.findMany({ where: { slug: { in: productSlugs } }, select: { id: true } });
        await prisma.productFabric.createMany({ data: products.map((p) => ({ productId: p.id, fabricId: fabric.id })), skipDuplicates: true });
      }
    }
  } catch (e) { handleAdminError(e, "saveFabric", "/admin/fabrics"); }
  revalidatePublicContent("public-fabrics");
  revalidatePath("/admin/fabrics");
  redirect("/admin/fabrics");
}

export async function deleteFabric(formData: FormData) {
  const id = parseAdminId(formData, "/admin/fabrics");
  try {
    await prisma.fabric.delete({ where: { id } });
  } catch (e) { handleAdminError(e, "deleteFabric", "/admin/fabrics"); }
  revalidatePublicContent("public-fabrics");
  revalidatePath("/admin/fabrics");
}

export async function saveOffer(formData: FormData) {
  const data = await parseAdminForm(offerSchema, formData, "/admin/offers");
  const productSlugs = (commaSeparated(formData, "products") ?? []) as string[];
  const payload = {
    ...data, id: undefined,
    startsAt: dateValue(formData, "startsAt"),
    endsAt: dateValue(formData, "endsAt")
  };
  try {
    if (data.id) {
      const offerId: string = data.id;
      await prisma.$transaction(async (tx) => {
        await tx.offer.update({ where: { id: offerId }, data: payload });
        await tx.offerProduct.deleteMany({ where: { offerId } });
        if (productSlugs.length > 0) {
          const products = await tx.product.findMany({ where: { slug: { in: productSlugs } }, select: { id: true } });
          await tx.offerProduct.createMany({ data: products.map((p) => ({ offerId, productId: p.id })), skipDuplicates: true });
        }
      });
    } else {
      const offer = await prisma.offer.create({ data: payload });
      if (productSlugs.length > 0) {
        const products = await prisma.product.findMany({ where: { slug: { in: productSlugs } }, select: { id: true } });
        await prisma.offerProduct.createMany({ data: products.map((p) => ({ offerId: offer.id, productId: p.id })), skipDuplicates: true });
      }
    }
  } catch (e) { handleAdminError(e, "saveOffer", "/admin/offers"); }
  revalidatePublicContent("public-offers");
  revalidatePath("/admin/offers");
  redirect("/admin/offers");
}

export async function deleteOffer(formData: FormData) {
  const id = parseAdminId(formData, "/admin/offers");
  try {
    await prisma.offer.delete({ where: { id } });
  } catch (e) { handleAdminError(e, "deleteOffer", "/admin/offers"); }
  revalidatePublicContent("public-offers");
  revalidatePath("/admin/offers");
}

export async function saveGalleryAlbum(formData: FormData) {
  const data = await parseAdminForm(galleryAlbumSchema, formData, "/admin/gallery");
  const payload = { ...data, id: undefined };
  try {
    if (data.id) await prisma.galleryAlbum.update({ where: { id: data.id }, data: payload });
    else await prisma.galleryAlbum.create({ data: payload });
  } catch (e) { handleAdminError(e, "saveGalleryAlbum", "/admin/gallery"); }
  revalidatePublicContent("public-gallery");
  revalidatePath("/admin/gallery");
  redirect("/admin/gallery");
}

export async function deleteGalleryAlbum(formData: FormData) {
  const id = parseAdminId(formData, "/admin/gallery");
  try {
    await prisma.galleryAlbum.delete({ where: { id } });
  } catch (e) { handleAdminError(e, "deleteGalleryAlbum", "/admin/gallery"); }
  revalidatePublicContent("public-gallery");
  revalidatePath("/admin/gallery");
}

export async function saveGalleryItem(formData: FormData) {
  const data = await parseAdminForm(galleryItemSchema, formData, "/admin/gallery");
  const payload = { ...data, id: undefined, sortOrder: numberValue(formData, "sortOrder"), isFeatured: checkbox(formData, "isFeatured") };
  try {
    if (data.id) await prisma.galleryItem.update({ where: { id: data.id }, data: payload });
    else await prisma.galleryItem.create({ data: payload });
  } catch (e) { handleAdminError(e, "saveGalleryItem", "/admin/gallery"); }
  revalidatePublicContent("public-gallery");
  revalidatePath("/admin/gallery");
}

export async function deleteGalleryItem(formData: FormData) {
  const id = parseAdminId(formData, "/admin/gallery");
  try {
    const item = await prisma.galleryItem.findUnique({ where: { id }, select: { publicId: true } });
    if (item?.publicId) await cloudinaryDeleteAsset(item.publicId);
    await prisma.galleryItem.delete({ where: { id } });
  } catch (e) { handleAdminError(e, "deleteGalleryItem", "/admin/gallery"); }
  revalidatePublicContent("public-gallery");
  revalidatePath("/admin/gallery");
}
