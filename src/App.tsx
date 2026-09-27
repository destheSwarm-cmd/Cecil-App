import React, { useState } from 'react';
import { Splash } from './components/Splash';
import { Header } from './components/Header';
import { BottomNav, NavTab } from './components/BottomNav';
import { HomeDashboard } from './components/HomeDashboard';
import { StockOperations } from './components/StockOperations';
import { OrderBuilder } from './components/OrderBuilder';
import { AIAssistant } from './components/AIAssistant';
import { HelperModeView } from './components/HelperModeView';
import { SettingsModal } from './components/SettingsModal';
import { HelperPINModal } from './components/modals/HelperPINModal';
import { QuickSaleModal } from './components/modals/QuickSaleModal';
import { LogSalesEODModal } from './components/modals/LogSalesEODModal';
import { usePubStore } from './lib/pubStore';

export default function App() {
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showHelperPINModal, setShowHelperPINModal] = useState<boolean>(false);
  const [showQuickSaleModal, setShowQuickSaleModal] = useState<boolean>(false);
  const [showEODModal, setShowEODModal] = useState<boolean>(false);

  const {
    products,
    sales,
    orders,
    messages,
    settings,
    discrepancies,
    syncQueue,
    isHelperMode,
    isOnline,
    todayTotalRand,
    todaySalesCount,
    totalWarehouseCases,
    totalFloorBottles,
    lowStockCount,
    setSettings,
    logDelivery,
    logPick,
    logQuickSale,
    logEODSale,
    saveProduct,
    bulkPriceUpdate,
    resolveDiscrepancy,
    addAIMessage,
    updateOrderStatus,
    toggleHelperMode,
  } = usePubStore();

  const draftOrders = orders.filter((o) => o.status === 'draft');

  return (
    <div className="min-h-screen bg-[#F4F6F4] text-[#111810] flex flex-col font-sans select-none antialiased">
      {/* Step 1: Animated Splash Screen (2.5s) */}
      {showSplash ? (
        <Splash onFinish={() => setShowSplash(false)} />
      ) : (
        <>
          {/* Persistent Header */}
          <Header
            isHelperMode={isHelperMode}
            isOnline={isOnline}
            pendingSyncCount={syncQueue.length}
            onOpenSettings={() => setShowSettingsModal(true)}
            onToggleHelperMode={() => setShowHelperPINModal(true)}
          />

          {/* Main App Content Area */}
          <main className="flex-1 max-w-md w-full mx-auto px-3.5 pt-3.5">
            {isHelperMode ? (
              /* Simplified Helper Operations View */
              <HelperModeView
                products={products}
                onLogDelivery={logDelivery}
                onLogPick={logPick}
                onExitHelperMode={() => setShowHelperPINModal(true)}
              />
            ) : (
              /* Owner Full Experience Tabs */
              <>
                {activeTab === 'home' && (
                  <HomeDashboard
                    ownerName={settings.owner_name}
                    todayTillTotal={todayTotalRand}
                    todaySalesCount={todaySalesCount}
                    warehouseCases={totalWarehouseCases}
                    floorBottles={totalFloorBottles}
                    lowStockCount={lowStockCount}
                    discrepancies={discrepancies}
                    draftOrders={draftOrders}
                    onOpenQuickSale={() => setShowQuickSaleModal(true)}
                    onOpenEOD={() => setShowEODModal(true)}
                    onNavigateToStock={() => setActiveTab('stock')}
                    onNavigateToOrders={() => setActiveTab('orders')}
                    onNavigateToAI={() => setActiveTab('ai')}
                  />
                )}

                {activeTab === 'stock' && (
                  <StockOperations
                    products={products}
                    warehouseCases={totalWarehouseCases}
                    floorBottles={totalFloorBottles}
                    lowStockCount={lowStockCount}
                    discrepancies={discrepancies}
                    isHelperMode={isHelperMode}
                    onLogDelivery={logDelivery}
                    onLogPick={logPick}
                    onLogEODSale={logEODSale}
                    onSaveProduct={saveProduct}
                    onResolveDiscrepancy={resolveDiscrepancy}
                  />
                )}

                {activeTab === 'orders' && (
                  <OrderBuilder
                    orders={orders}
                    settings={settings}
                    onUpdateOrderStatus={updateOrderStatus}
                  />
                )}

                {activeTab === 'ai' && (
                  <AIAssistant
                    messages={messages}
                    products={products}
                    todaySalesTotal={todayTotalRand}
                    discrepancies={discrepancies}
                    orders={orders}
                    onSendMessage={addAIMessage}
                  />
                )}
              </>
            )}
          </main>

          {/* Bottom Navigation (Hidden in Helper Mode to keep screen ultra-simple) */}
          {!isHelperMode && (
            <BottomNav
              activeTab={activeTab}
              onChangeTab={setActiveTab}
              lowStockCount={lowStockCount}
              draftOrdersCount={draftOrders.length}
            />
          )}

          {/* Quick Sale Keypad Modal */}
          <QuickSaleModal
            isOpen={showQuickSaleModal}
            onClose={() => setShowQuickSaleModal(false)}
            onConfirm={(amount, method) => logQuickSale(amount, method)}
          />

          {/* Log Sales EOD Modal */}
          <LogSalesEODModal
            products={products}
            isOpen={showEODModal}
            onClose={() => setShowEODModal(false)}
            onConfirm={logEODSale}
          />

          {/* Settings & Email Configuration Modal */}
          <SettingsModal
            settings={settings}
            products={products}
            isOpen={showSettingsModal}
            onClose={() => setShowSettingsModal(false)}
            onSaveSettings={setSettings}
            onBulkPriceUpdate={bulkPriceUpdate}
          />

          {/* Helper Mode PIN Switch Modal */}
          <HelperPINModal
            isOpen={showHelperPINModal}
            isHelperMode={isHelperMode}
            onClose={() => setShowHelperPINModal(false)}
            onSubmitPIN={toggleHelperMode}
          />
        </>
      )}
    </div>
  );
}
