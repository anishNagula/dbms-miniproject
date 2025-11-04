// profilepage.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import './ProfilePage.css'; // <-- IMPORT THE NEW CSS

const ProfilePage = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState({ project_completed_count: 0, total_skills: 0 });
  const [mySkills, setMySkills] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedProficiency, setSelectedProficiency] = useState('Beginner');
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [detailsRes, mySkillsRes, allSkillsRes] = await Promise.all([
        api.get('/users/profile/details'), // Get details from our new endpoint
        api.get('/users/profile/skills'),
        api.get('/skills')
      ]);
      setProfileData(detailsRes.data);
      setMySkills(mySkillsRes.data);
      setAllSkills(allSkillsRes.data);
      if (allSkillsRes.data.length > 0) {
        setSelectedSkill(allSkillsRes.data[0].skill_id);
      }
    } catch (err) {
      setError('Failed to load profile data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddSkill = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/users/profile/skills', {
        skill_id: selectedSkill,
        proficiency: selectedProficiency
      });
      // Refresh all data
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add skill.');
    }
  };

  const handleRemoveSkill = async (skillId) => {
    try {
      await api.delete(`/users/profile/skills/${skillId}`);
      // Refresh all data
      fetchData();
    } catch (err) {
      setError('Failed to remove skill.');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-container">
      <h2>My Profile</h2>
      <div className="profile-card" style={{ background: '#fff', padding: '2rem', borderRadius: '8px' }}>
        <h3>{user.f_name} {user.l_name}</h3>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> {user.role}</p>
        
        {/* --- DEMO VALUES --- */}
        <p><strong>Projects Completed:</strong> {profileData.project_completed_count}</p>
        <p><strong>Total Skills:</strong> {profileData.total_skills}</p>
        {/* --- END DEMO VALUES --- */}

        <hr style={{ margin: '2rem 0' }} />

        <h3>My Skills</h3>
        {mySkills.length > 0 ? (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {mySkills.map(skill => (
              <li key={skill.skill_id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', borderBottom: '1px solid #eee' }}>
                <span>{skill.skill_name} ({skill.proficiency})</span>
                <button onClick={() => handleRemoveSkill(skill.skill_id)} style={{ background: '#dc3545', fontSize: '0.8rem' }}>Remove</button>
              </li>
            ))}
          </ul>
        ) : (
          <p>You have not added any skills yet.</p>
        )}

        <h3 style={{ marginTop: '2rem' }}>Add a New Skill</h3>
        <form onSubmit={handleAddSkill}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <select value={selectedSkill} onChange={e => setSelectedSkill(e.target.value)} style={{ flex: 2, padding: '0.5rem' }}>
              {allSkills.map(skill => (
                <option key={skill.skill_id} value={skill.skill_id}>
                  {skill.skill_name}
                </option>
              ))}
            </select>
            <select value={selectedProficiency} onChange={e => setSelectedProficiency(e.target.value)} style={{ flex: 1, padding: '0.5rem' }}>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Expert">Expert</option>
            </select>
          </div>
          <button type="submit" style={{ marginTop: '1rem', width: '100%' }}>Add Skill</button>
          {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;