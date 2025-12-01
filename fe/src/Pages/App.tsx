import ChatComponent from '../components/ChatComponent';

import Contacts from '../components/Contacts'; 
function App() {
  return (
    <>
      <main className="flex h-screen">
        <section className=" w-1/3">
          <Contacts />

        </section>
        <section className=" w-2/3">
          <section>
            <ChatComponent />
          </section>
        </section>
      </main>
      <footer></footer>
    </>
  );
}

export default App;
