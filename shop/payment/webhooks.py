import stripe
from django.conf import settings
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from orders.models import Order
from main.models import Product
import logging

logger = logging.getLogger(__name__)

@csrf_exempt
def stripe_webhook(request):
    logger.info("🔄 STRIPE WEBHOOK: Received webhook request")

    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')

    if not sig_header:
        logger.error("❌ STRIPE WEBHOOK: Missing Stripe signature header")
        return HttpResponse(status=400)

    event = None
    try:
        event = stripe.Webhook.construct_event(
            payload,
            sig_header,
            settings.STRIPE_WEBHOOK_SECRET
        )
        logger.info(f"✅ STRIPE WEBHOOK: Event verified: {event.type}")
    except ValueError as e:
        logger.error(f"❌ STRIPE WEBHOOK: Invalid payload: {e}")
        return HttpResponse(status=400)
    except stripe.error.SignatureVerificationError as e:
        logger.error(f"❌ STRIPE WEBHOOK: Invalid signature: {e}")
        return HttpResponse(status=400)

    # Обработка события оплаты
    if event.type == 'checkout.session.completed':
        session = event.data.object
        logger.info(f"💳 STRIPE WEBHOOK: Processing payment for session {session.id}")
        logger.info(f"📊 STRIPE WEBHOOK: Payment status: {session.payment_status}")
        logger.info(f"🆔 STRIPE WEBHOOK: Client reference ID: {session.client_reference_id}")

        if session.mode == 'payment' and session.payment_status == 'paid':
            try:
                order_id = session.client_reference_id
                order = Order.objects.get(id=order_id)
                logger.info(f"📦 STRIPE WEBHOOK: Found order {order.id}, current paid status: {order.paid}")

                # Обновляем статус заказа
                order.paid = True
                order.stripe_id = session.payment_intent
                order.save()

                logger.info(f"✅ STRIPE WEBHOOK: Order {order.id} marked as paid")

            except Order.DoesNotExist:
                logger.error(f"❌ STRIPE WEBHOOK: Order {order_id} not found")
                return HttpResponse(status=404)
            except Exception as e:
                logger.error(f"❌ STRIPE WEBHOOK: Error updating order: {e}")
                return HttpResponse(status=500)
        else:
            logger.warning(f"⚠️ STRIPE WEBHOOK: Payment not completed or not in payment mode")

    logger.info("✅ STRIPE WEBHOOK: Webhook processing completed")
    return HttpResponse(status=200)