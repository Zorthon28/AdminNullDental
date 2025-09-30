import { useState, useEffect } from "react";

interface PushNotificationData {
  title: string;
  body: string;
  url?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
}

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  );

  useEffect(() => {
    // Check if push notifications are supported
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      setPermission(Notification.permission);

      // Register service worker
      registerServiceWorker();

      // Check existing subscription
      checkSubscription();
    }
  }, []);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });
      console.log("Service Worker registered:", registration);
    } catch (error) {
      console.error("Service Worker registration failed:", error);
    }
  };

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const existingSubscription =
        await registration.pushManager.getSubscription();

      if (existingSubscription) {
        setIsSubscribed(true);
        setSubscription(existingSubscription);
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
    }
  };

  const requestPermission = async (): Promise<NotificationPermission> => {
    if (!isSupported) {
      throw new Error("Push notifications are not supported in this browser");
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      throw error;
    }
  };

  const subscribe = async (
    vapidPublicKey?: string
  ): Promise<PushSubscription | null> => {
    if (!isSupported) {
      throw new Error("Push notifications are not supported");
    }

    if (permission !== "granted") {
      throw new Error("Notification permission not granted");
    }

    try {
      const registration = await navigator.serviceWorker.ready;

      // You'll need to provide your VAPID public key here
      // For development, you can use a test key or implement server-side VAPID key management
      const applicationServerKey =
        vapidPublicKey || process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

      if (!applicationServerKey) {
        console.warn(
          "No VAPID public key provided. Push notifications will work locally but not with a push service."
        );
      }

      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
          ? urlBase64ToUint8Array(applicationServerKey)
          : undefined,
      });

      setIsSubscribed(true);
      setSubscription(pushSubscription);

      // Send subscription to server for storage
      await sendSubscriptionToServer(pushSubscription);

      return pushSubscription;
    } catch (error) {
      console.error("Error subscribing to push notifications:", error);
      throw error;
    }
  };

  const unsubscribe = async (): Promise<void> => {
    if (!subscription) return;

    try {
      await subscription.unsubscribe();
      setIsSubscribed(false);
      setSubscription(null);

      // Remove subscription from server
      await removeSubscriptionFromServer(subscription);
    } catch (error) {
      console.error("Error unsubscribing from push notifications:", error);
      throw error;
    }
  };

  const sendNotification = async (
    data: PushNotificationData
  ): Promise<void> => {
    if (!isSubscribed || !subscription) {
      throw new Error("Not subscribed to push notifications");
    }

    try {
      // In a real implementation, you would send this to your push service
      // For now, we'll trigger a local notification for testing
      if ("serviceWorker" in navigator && "Notification" in window) {
        const registration = await navigator.serviceWorker.ready;

        await registration.showNotification(data.title, {
          body: data.body,
          icon: data.icon || "/favicon.ico",
          badge: data.badge || "/favicon.ico",
          tag: data.tag,
          requireInteraction: data.requireInteraction,
          silent: data.silent,
          data: {
            url: data.url || "/",
          },
        });
      }
    } catch (error) {
      console.error("Error sending notification:", error);
      throw error;
    }
  };

  // Helper functions for server communication
  const sendSubscriptionToServer = async (
    subscription: PushSubscription
  ): Promise<void> => {
    try {
      // Send subscription to your server
      const response = await fetch("/api/push-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send subscription to server");
      }
    } catch (error) {
      console.error("Error sending subscription to server:", error);
      // Don't throw here as the subscription still works locally
    }
  };

  const removeSubscriptionFromServer = async (
    subscription: PushSubscription
  ): Promise<void> => {
    try {
      const response = await fetch("/api/push-subscription", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to remove subscription from server");
      }
    } catch (error) {
      console.error("Error removing subscription from server:", error);
      // Don't throw here
    }
  };

  return {
    isSupported,
    isSubscribed,
    permission,
    subscription,
    requestPermission,
    subscribe,
    unsubscribe,
    sendNotification,
  };
}

// Utility function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
