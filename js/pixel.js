/**
 * Gemini AI PRO - Meta / Facebook Pixel Tracking & Analytics Hub
 * Configuração de rastreamento de alta precisão para tráfego pago (Facebook Ads / Instagram Ads)
 */

window.GEMINI_CONFIG = {
  // Substitua pelo seu Pixel ID do Facebook Ads (ex: '123456789012345')
  pixelId: '123456789012345',
  
  // URL de destino do checkout (Cakto Pay)
  checkoutUrl: 'https://pay.cakto.com.br/tpht2my_1048893',
  
  product: {
    name: 'Gemini AI PRO - 18 Meses por R$ 97',
    id: 'gemini-ai-pro-18-meses-97',
    price: 97.00,
    currency: 'BRL',
    category: 'Software / Artificial Intelligence / 18 Months Special Offer'
  },

  // Modo debug: exibe alertas/logs no console sobre os eventos disparados
  debug: true
};

// Inicializador do Facebook Pixel oficial
(function() {
  const config = window.GEMINI_CONFIG;
  
  // Injeta o snippet padrão do Meta Pixel se não existir
  if (!window.fbq) {
    (function(f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function() {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

    if (config.pixelId && config.pixelId !== 'SEU_PIXEL_AQUI') {
      window.fbq('init', config.pixelId);
      window.fbq('track', 'PageView');
      if (config.debug) {
        console.log(`%c[Pixel Meta] Inicializado com ID: ${config.pixelId} | PageView disparado`, 'color: #1a73e8; font-weight: bold;');
      }
    } else {
      if (config.debug) {
        console.warn('[Pixel Meta] Nenhum Pixel ID configurado ou valor padrão mantido em window.GEMINI_CONFIG.pixelId');
      }
    }
  }
})();

/**
 * Utilitário para coletar parâmetros UTM e FBCLID da URL atual
 */
function getTrackingParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'src', 'sck'];
  const params = {};
  
  utmKeys.forEach(key => {
    if (urlParams.has(key)) {
      params[key] = urlParams.get(key);
    }
  });

  return params;
}

/**
 * Constrói a URL final de checkout anexando UTMs automaticamente
 */
function buildCheckoutUrl(customBaseUrl) {
  const base = customBaseUrl || window.GEMINI_CONFIG.checkoutUrl;
  try {
    const url = new URL(base, window.location.origin);
    const trackingParams = getTrackingParams();
    
    Object.keys(trackingParams).forEach(key => {
      url.searchParams.set(key, trackingParams[key]);
    });
    
    return url.toString();
  } catch (e) {
    return base;
  }
}

/**
 * Disparador de eventos personalizados e padrão do Meta Pixel
 */
function trackPixelEvent(eventName, eventData = {}) {
  const config = window.GEMINI_CONFIG;
  
  if (typeof window.fbq === 'function') {
    window.fbq('track', eventName, eventData);
  }

  if (config.debug) {
    console.log(`%c[Pixel Meta] Evento Disparado: ${eventName}`, 'color: #34a853; font-weight: bold;', eventData);
  }
}

/**
 * Triggers de conversão automáticos
 */
document.addEventListener('DOMContentLoaded', () => {
  const config = window.GEMINI_CONFIG;
  
  // 1. Atualizar todos os links de CTA com UTMs automáticas
  const ctaLinks = document.querySelectorAll('[data-cta-button], .js-cta-checkout');
  ctaLinks.forEach(link => {
    if (link.tagName === 'A' && !link.getAttribute('href')?.startsWith('#')) {
      link.href = buildCheckoutUrl(link.getAttribute('href') || config.checkoutUrl);
    }

    link.addEventListener('click', (e) => {
      const buttonPosition = link.getAttribute('data-cta-position') || 'unknown';
      
      trackPixelEvent('InitiateCheckout', {
        content_name: config.product.name,
        content_ids: [config.product.id],
        content_type: 'product',
        value: config.product.price,
        currency: config.product.currency,
        cta_position: buttonPosition,
        traffic_source: getTrackingParams().utm_source || 'organic'
      });
    });
  });

  // 2. Rastreamento de rolagem até a seção de Preço/Benefícios (ViewContent)
  let viewContentTriggered = false;
  const pricingSection = document.getElementById('pricing') || document.getElementById('planos');
  
  if (pricingSection && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !viewContentTriggered) {
          viewContentTriggered = true;
          trackPixelEvent('ViewContent', {
            content_name: 'Plano Google AI Pro - R$ 96,99/mês',
            content_type: 'product_group',
            value: config.product.price,
            currency: config.product.currency
          });
        }
      });
    }, { threshold: 0.3 });
    
    observer.observe(pricingSection);
  }

  // 3. Rastreamento de interação com FAQ (Lead engagement)
  const faqItems = document.querySelectorAll('.faq-item');
  let faqTracked = false;
  faqItems.forEach(item => {
    item.addEventListener('click', () => {
      if (!faqTracked) {
        faqTracked = true;
        trackPixelEvent('Contact', {
          action: 'faq_expanded',
          section: 'duvidas_frequentes'
        });
      }
    });
  });
});

// Exporta globalmente para uso de scripts secundários
window.trackPixelEvent = trackPixelEvent;
window.buildCheckoutUrl = buildCheckoutUrl;
