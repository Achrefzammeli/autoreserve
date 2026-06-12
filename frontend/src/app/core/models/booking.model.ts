export interface Booking {
  id:number;
  userId:number;
  vehicleId:number;
  startDate:Date;
  endDate:Date;
  totalPrice:number;
  status:string;
}