import { useState } from 'react';
import { List } from '@mui/material';
import ContactList from '../components/ContactList';
import ContactHeader from '../components/ContactHeader';

function ContactPage() {
  const [showSearch, setShowSearch] = useState(false); // state toggle search bar
  const [searchQuery, setSearchQuery] = useState('');

  const contacts = [
    { name: 'Contact 1', avatar: 'https://i.pravatar.cc/40?img=1' },
    { name: 'Contact 2', avatar: 'https://i.pravatar.cc/40?img=2' },
    { name: 'Contact 3', avatar: 'https://i.pravatar.cc/40?img=3' },
  ];

  // filter contacts based on searchQuery
  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-row w-full border-black border-2 h-screen">
      {/* Contacts Sidebar */}
      <div className="flex flex-col w-1/4 border-r border-blue-300">
        {/* Contact Header with Search */}
        <ContactHeader
          showSearch={showSearch}
          setShowSearch={setShowSearch}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Contacts List */}
        <div className="flex-grow overflow-y-auto">
          <List className="p-0">
            {filteredContacts.map((contact, index) => (
              <ContactList
                key={contact.name}
                filteredContacts={filteredContacts}
                contact={contact}
                index={index}
              />
            ))}
          </List>
        </div>
      </div>

      {/* Chat Section */}
      <div className="flex flex-col w-3/4 p-4">
        <h2>Chat</h2>
      </div>
    </div>
  );
}

export default ContactPage;
