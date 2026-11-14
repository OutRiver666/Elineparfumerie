export interface Testimonial {
  id: string;
  author: string;
  city: string;
  quote: string;
  perfume: string;
  rating: number; // 1 to 5
  createdAt: string; // ISO string
  isVerified?: boolean;
  isPublished?: boolean;
}

export interface CreateTestimonialInput {
  author: string;
  city: string;
  quote: string;
  perfume: string;
  rating: number;
}
