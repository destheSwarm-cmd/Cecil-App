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
import { SalesInsightsModal } from './components/SalesInsightsModal';
import { MatchDaysModal } from './components/MatchDaysModal';
import { usePubStore } from './lib/pubStore';
import { getStoredMatches, saveStoredMatches } from './lib/matchFixtures';
import { MatchFixture } from './types/pub';

export default function App() {
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showHelperPINModal, setShowHelperPINModal] = useState<boolean>(false);
  const [showQuickSaleModal, setShowQuickSaleModal] = useState<boolean>(false);
  const [showEODModal, setShowEODModal] = useState<boolean>(false);
  const [showSalesInsightsModal, setShowSalesInsightsModal] = useState<boolean>(false);
  const [showMatchDaysModal, setShowMatchDaysModal] = useState<boolean>(false);

  // ADD 3: Match Days fixtures state
  const [matches, setMatches] = useState<MatchFixture[]>(() => getStoredMatches());

  const handleUpdateMatches = (updated: MatchFixture[]) => {
    setMatches(updated);
    saveStoredMatches(updated);
  };

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
    verifyAndReconcileShrinkage,
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
              /* Owner Full Experience Tabs (Preserving exact 4 tabs: Home, Stock, Orders, AI) */
              <>
                {activeTab === 'home' && (
                  <HomeDashboard
                    ownerName={settings.owner_name}
                    venuePhoto={settings.venue_photo}
                    todayTillTotal={todayTotalRand}
                    todaySalesCount={todaySalesCount}
                    warehouseCases={totalWarehouseCases}
                    floorBottles={totalFloorBottles}
                    lowStockCount={lowStockCount}
                    discrepancies={discrepancies}
                    draftOrders={draftOrders}
                    matches={matches}
                    onOpenQuickSale={() => setShowQuickSaleModal(true)}
                    onOpenEOD={() => setShowEODModal(true)}
                    onOpenSalesInsights={() => setShowSalesInsightsModal(true)}
                    onOpenMatchDays={() => setShowMatchDaysModal(true)}
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
                    onVerifyAndReconcileShrinkage={verifyAndReconcileShrinkage}
                  />
                )}

                {activeTab === 'orders' && (
                  <OrderBuilder
                    orders={orders}
                    settings={settings}
                    onUpdateOrderStatus={updateOrderStatus}
                    onOpenSalesInsights={() => setShowSalesInsightsModal(true)}
                  />
                )}

                {activeTab === 'ai' && (
                  <AIAssistant
                    messages={messages}
                    products={products}
                    todaySalesTotal={todayTotalRand}
                    discrepancies={discrepancies}
                    orders={orders}
                    venuePhoto={settings.venue_photo}
                    matches={matches}
                    onSendMessage={addAIMessage}
                  />
                )}
              </>
            )}
          </main>

          {/* Bottom Navigation (Strictly 4 tabs: Home | Stock | Orders | AI) */}
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

          {/* ADD 2: Sales Insights Screen Modal */}
          <SalesInsightsModal
            isOpen={showSalesInsightsModal}
            onClose={() => setShowSalesInsightsModal(false)}
            sales={sales}
            products={products}
          />

          {/* ADD 3: Match Days Screen Modal */}
          <MatchDaysModal
            isOpen={showMatchDaysModal}
            onClose={() => setShowMatchDaysModal(false)}
            matches={matches}
            onUpdateMatches={handleUpdateMatches}
            tavernAddress={settings.address}
          />
        </>
      )}
    </div>
  );
}
