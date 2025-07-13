
import Booking from "../models/Booking.js";


export const midtransCallback = async (req, res)=>{
    const webhookMessage = JSON.parse(JSON.stringify(req.body));
    console.log("MESSAGE", webhookMessage);
    const transactionStatus = webhookMessage.transaction_status;
    const fraudStatus = webhookMessage.fraud_status;
    const orderId = webhookMessage.order_id;
    const bookingId = orderId.split("#")[1];
    console.log("Booking ID", bookingId)

    let paymentStatus;

    console.log("BASEfraudStatus", fraudStatus)
    console.log("BASEpaymentStatus", paymentStatus)


    if (transactionStatus === 'capture') {
      if (fraudStatus === 'accept') {
        paymentStatus = 'success';
      } else {
        paymentStatus = 'pending'; // fraud review
      }
    } else if (transactionStatus === 'settlement') {
      paymentStatus = 'success';
    } else if (
      transactionStatus === 'cancel' ||
      transactionStatus === 'deny' ||
      transactionStatus === 'expire'
    ) {
      paymentStatus = 'failure';
    } else if (transactionStatus === 'pending') {
      paymentStatus = 'pending';
    }

    console.log("fraudStatus", fraudStatus)
    console.log("paymentStatus", paymentStatus)

    if (paymentStatus === "success") {
        console.log("START UPDATE")
        try{
            console.log("TRY UPDATE booking")
            const updatedBooking = await Booking.findByIdAndUpdate(
                bookingId,
                {status: "confirmed", isPaid: true}
            )
            console.log("FINISH UPDATE booking")

            if (!updatedBooking) {
                console.log("NO UPDATE BOOKING")
                return res.json({success: false, message: "Failed update booking"}) 
            }

            return res.json({success: true, message: "Success"})
        } catch (error){
            console.log("ERR", error)
            return res.json({success: false, message: "Failed update booking"}) 
        }
        
    }
    return res.json({success: true, message: "Pending"})
}

export const getPaymentToken = async (req, res) => {
    try {
        const { bookingId } = req.body;
        const booking = await Booking.findById(bookingId);
        const totalPrice = booking.totalPrice;

        const midtransPayload = {
            transaction_details: {
                order_id: `${generateRandomAlphanumeric(8)}#${bookingId}`,
                gross_amount: totalPrice,
            },
            item_details: [
                {
                    price: totalPrice,
                    quantity: 1,
                    name: "Billiard Booking",
                    booking_id: bookingId
                }
            ]
        }

        const authString = Buffer.from(`${process.env.MIDTRANS_SERVER_KEY}:`).toString("base64")

        const midtransUrl = `${process.env.MIDTRANS_BASE_URL}/snap/v1/transactions`

        const midtransResponse = await fetch(midtransUrl, {
            method: "POST",
            headers: {
                'Content-Type': "application/json",
                Authorization: `Basic ${authString}`
            },
            body: JSON.stringify(midtransPayload)
        })

        const midtransResponseJson = await midtransResponse.json()
        console.log("TRACE token", midtransResponseJson)
        res.json({success: true, token: midtransResponseJson.token})

    } catch (error) {
        console.log("ERROR", error)
        res.json({success: false, message: "Payment Failed"})
    }
}

function generateRandomAlphanumeric(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  let result = '';
  const charsLength = chars.length;

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charsLength);
    result += chars.charAt(randomIndex);
  }

  return result;

}