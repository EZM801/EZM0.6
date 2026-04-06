import { NextResponse } from 'next/server'

export interface ApiErrorResponse {
  error: string
  status?: number
}

export interface ApiSuccessResponse<T> {
  data: T
  status?: number
}

export const withApiHandler = async <T>(
  handler: () => Promise<T>,
  errorMessage: string = 'Internal Server Error'
): Promise<NextResponse> => {
  try {
    const result = await handler()
    return NextResponse.json(result)
  } catch (error) {
    console.error(errorMessage, error)
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

export const createErrorResponse = (
  message: string,
  status: number = 500
): NextResponse => {
  return NextResponse.json(
    { error: message },
    { status }
  )
}

export const createSuccessResponse = <T>(
  data: T,
  status: number = 200
): NextResponse => {
  return NextResponse.json(data, { status })
} 