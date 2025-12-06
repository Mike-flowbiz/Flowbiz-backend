import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, withAuthz } from '@/lib/middleware/auth';

// GET /api/products - Get all products
export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
});

// POST /api/products - Create product
export const POST = withAuthz(['ADMIN', 'CONTRACTOR'], async (request: NextRequest, user) => {
  try {
    const body = await request.json();
    const { name, description, type, price, unit, category } = body;

    if (!name || price === undefined) {
      return NextResponse.json(
        { error: 'Name and price are required' },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: { name, description, type, price, unit, category },
    });

    return NextResponse.json(
      { message: 'Product created', product },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
});
