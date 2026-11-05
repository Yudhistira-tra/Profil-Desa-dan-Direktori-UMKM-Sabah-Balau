import {umkmData} from "../data/umkm";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve,ms));

export async function getUmkmList() {
    await delay(300);
    return umkmData;
}

export async function getUmkmBySlug(slug) {
    await delay(300);
    return umkmData.find((umkm) => umkm.slug === slug);
}