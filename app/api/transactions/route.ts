import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Transaction from '@/models/Transaction';

export async function GET() {
  try {
    await dbConnect();
    const transactions = await Transaction.find({}).sort({ createdAt: -1 });
    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    
    const transaction = new Transaction({
      amount: body.amount,
      date: body.date,
      description: body.description,
      type: body.type,
      category: body.type === 'expense' ? body.category : 'Income'
    });

    const savedTransaction = await transaction.save();
    return NextResponse.json(savedTransaction, { status: 201 });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}