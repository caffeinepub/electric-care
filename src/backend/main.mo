import Map "mo:core/Map";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Array "mo:core/Array";



actor {
  type BookingStatus = {
    #pending;
    #confirmed;
    #completed;
  };

  type Booking = {
    id : Nat;
    customerName : Text;
    email : Text;
    phone : Text;
    serviceName : Text;
    price : Nat;
    gpsCoordinates : Text;
    timestamp : Time.Time;
    status : BookingStatus;
  };

  module Booking {
    public func compare(booking1 : Booking, booking2 : Booking) : Order.Order {
      Nat.compare(booking1.id, booking2.id);
    };
  };

  var nextBookingId = 0;
  let bookings = Map.empty<Nat, Booking>();

  public shared ({ caller }) func createBooking(customerName : Text, email : Text, phone : Text, serviceName : Text, price : Nat, gpsCoordinates : Text) : async Nat {
    let booking : Booking = {
      id = nextBookingId;
      customerName;
      email;
      phone;
      serviceName;
      price;
      gpsCoordinates;
      timestamp = Time.now();
      status = #pending;
    };

    bookings.add(nextBookingId, booking);
    nextBookingId += 1;
    booking.id;
  };

  public query ({ caller }) func getAllBookings() : async [Booking] {
    bookings.values().toArray().sort();
  };

  public shared ({ caller }) func updateBookingStatus(bookingId : Nat, status : BookingStatus) : async () {
    switch (bookings.get(bookingId)) {
      case (null) { Runtime.trap("Booking does not exist") };
      case (?booking) {
        bookings.add(bookingId, { booking with status });
      };
    };
  };
};
