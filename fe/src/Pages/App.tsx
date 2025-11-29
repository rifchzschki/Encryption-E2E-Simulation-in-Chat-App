import ChatComponent from '../components/ChatComponent';

import {useAuth} from '../context/AuthContext';
import Contacts from '../components/Contacts'; // Adjust the path if necessary
function App() {
  const {token, username} = useAuth();
  return (
    <>
      <main className="flex h-screen">
        <section className=" w-1/3">
          <Contacts />

        </section>
        <section className=" w-2/3">
          {/* <section>Profile Receiver Information</section> */}
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
