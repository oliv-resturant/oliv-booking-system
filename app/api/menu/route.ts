import { getCompleteMenuData } from "@/lib/actions/menu";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const menuData = await getCompleteMenuData();
    return NextResponse.json(menuData);
  } catch (error) {
    console.error("Error in menu API:", error);
    return NextResponse.json(
      { categories: [], items: [], addons: [], itemsByCategory: {} },
      { status: 500 }
    );
  }
}
