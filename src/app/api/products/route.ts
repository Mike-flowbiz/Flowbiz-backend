import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, withAuthz } from '@/lib/middleware/auth';

// GET /api/products - Get all products
export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const isActive = searchParams.get('isActive');

    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (type) {
      where.type = type as 'PRODUCT' | 'SERVICE';
    }
    
    if (category) {
      where.category = { contains: category, mode: 'insensitive' };
    }
    
    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }

    const products = await prisma.product.findMany({
      where,
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

    if (price < 0) {
      return NextResponse.json(
        { error: 'Price must be a positive number' },
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
